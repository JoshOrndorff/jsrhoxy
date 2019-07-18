const { patternMatch } = require('./patternMatcher.js');
const { Map, List, Set } = require('immutable');
const { qdHash, mergeRandom } = require('./jankyCrypto.js');

module.exports = {
  evaluateInEnvironment,
  mergeRandom, // re-export from jankyCrypto
  commable,
  structEquiv,
  structuralHash,
  findSubCommsFor,
  findCommsFor,
  prettyPrint,
}

/**
 * Given an AST, returns a fully concrete version of the same AST.
 * All variables will have been looked up in the appropriate environment.
 * Finally, .equals() and  .hashCode() methods will be attached for proper
 * insertion into the tuplespace, and the AST will be (shallow) frozen.
 *
 * @param term The term to be made concrete
 * @param env The environment bindings to use: an immutable Map
 * @return Concrete AST with .hashCode method
 */
function evaluateInEnvironment (term, env) {
  let result;

  switch (term.tag) {

    case "ground":
      result = term;
      break;

    case "variable": {
      result = env.get(term.givenName);
      break;
    }

    case "send*":
    case "send":
      result = { ...term };
      result.chan = evaluateInEnvironment(term.chan, env);
      result.message = evaluateInEnvironment(term.message, env);
      break;


    case "join*":
    case "join": {
      // Make each action's channel concrete
      let concreteActions = [];
      for (let action of term.actions) {
        concreteAction = {
          tag: "action",
          chan: evaluateInEnvironment(action.chan, env),
          pattern: action.pattern, // TODO This should be evaluated in environment
          // for cases like (x, y, =z), so z can be concretized?
        };
        concreteActions.push(concreteAction);
      }

      // Make sure there aren't any free variables in the continuation
      // If I want to implement direct substitution, I'll prefer to
      // formally bind those names to some kind of plugboard
      // Idea, every process has its own registry. When that registry
      // is non-empty, explicit substitution must take place before
      // executing the process
      if ( true /*TODO:  freeNames(term.continuation) subsetof Set(env.ownKeys))*/) {
        result = { ...term };
        result.actions = concreteActions;
      }
      else {
        throw "Free names not allowed in continuation. Explicit substitution not yet supported."
      }
      break;
    }

    default:
      throw "Non-exhaustive pattern match in evaluateInEnvironment." + term.tag;
  }

  // Tack on the methods and return.
  return Object.freeze({
    ...result,
    equals: (other) => (structuralHash(result) === structuralHash(other)) && result.randomState === other.randomState,
    hashCode: () => structuralHash(result),
  });
}


/**
 * Determine whether a join and a set of sends are compatible
 * (same channel, patterns match, etc) for a complete comm event.
 * O(n2) algorithm to pair the actions with the sends
 *
 * This function uses all immutable data structures.
 *
 * @param actions The Set of remaining actions to pair
 * @param sends The Set of remaining sends to pair
 * @return either a Map of bindings, or false
 */
function commable(actions, sends) {
  if (actions.size === 0 && sends.size === 0) {
    return new Map();
  }

  let action = actions.first();
  let currentBindings;
  for (let send of sends.values()) {

    currentBindings = subcommable(action, send);

    if (currentBindings !== false) {
      let remainingBindings = commable(actions.remove(action), sends.remove(send));

      if (remainingBindings !== false) {
        //TODO make sure the same name isn't used twice as a binder
        //TODO Rather than returning in the middle of the loop,
        // I should accumulate all the ways the comm can happen.
        // Maybe optional early-return for #PerformanceReasons.
        return remainingBindings.merge(currentBindings);
      }
    }

  }

  // No sends matched this action
  return false;
}

/**
 * Test whether an action and a send would fit together in a comm event.
 * If so calculate the bindings.
 *
 * @param action An AST for a single action
 * @param send An AST for a single send
 */
function subcommable(action, send) {
  if (structEquiv(action.chan, send.chan)) {
    return patternMatch(action.pattern, send.message);
  }

  return false;
}

/**
 * Tells whether two terms are structurally equivalent
 * The two terms passed in should be fully concrete.
 * No more variable mentions present.
 * @param a The first term to check
 * @param b The second term to check
 * @return Boolean, whether a and b are structurally equivalent
 */
function structEquiv(a, b) {
  return structuralHash(a) === structuralHash(b);
}


/**
 * Computes a hash for a rholang term. The hash is unique
 * up to structural equivalence and thus is used to test for
 * structural equivalence.
 *
 * Does not consider a term's random state, equals, hashCode, etc
 *
 * Terms being passed in here must be fully concrete so that
 * there are no free variable mentions.
 *
 * Seems like Kyle already thought about this:
 * https://rchain.atlassian.net/wiki/spaces/RHOL/pages/215351798/Term+Normalization+and+Structural+Equivalence.
 * @param the term to hash
 * @return the hashcode (number? what type?)
 */
function structuralHash(term) {

  if (term.tag === "bundle") {
    return structuralHash(term.proc);
  }

  // Hash of each AST is constructed from its tag and the "rest"
  // Rest depends on what type of AST we have.
  let rest;

  switch (term.tag) {

    case "ground":
      // Instantiated unforgeables are equivalent iff they have same randomState
      // See case "new" for internally-bound unforgeables.
      rest = qdHash(term.type) ^ qdHash(term.value);
      break;

    case "send*":
      throw "hashing send* not yet implemented";

    case "send":
      rest = structuralHash(term.chan) ^ (structuralHash(term.message) << 2);
      break;

    case "join":

    case "join":
    // Consider the continuation
    rest ^= structuralHash(term.body);
    // No break, so fall thorugh to remaining behavior that also applies to join*

    case "join*":
      //TODO This is broken. If listening on the same channel twice,
      // their hashes will cancel out. Bit-shifting isn't a great solution either
      // because then commutativity is lost. Normalization (link above)
      for (let action of term.actions) {
        rest ^= structuralHash(action.chan) ^ structuralHash(action.pattern);
      }

      break;

    case "par":
      throw "hashing par not yet implemented";

    case "new":
      // Bound unforgeables are inside. Rather than implementing additional logic
      // to do debruijn indices or maintain a map, Can we somehow start it with a
      // standard random State so that it will always hash the same.
      throw "hashing new not yet implemented";

    // Patterns need not be evaluated
    // Actually, why did this ever come up
    case "variableP":
      rest = 0;
      break;

    default:
      throw "Non-exhaustive pattern match in structuralHash: " + term.tag;
  }

  return (qdHash(term.tag) ^ rest);
}

/**
 * Calculate the freenames of a process
 *
 * @return Javascript list of freenames.
 */
function freeNames(term) {
  switch (term.tag) {
    case "ground":
      return [];

    case "send":
      return send.chan
  }
}

/**
 * Finds all possible comms for the given join and given sends.
 *
 * @param join A join AST to find sends to comm with
 * @param sendsMap A map from channels to sends on those channels
 *          in the style of the tuplespace
 * @return a list of lists of sends
 */
function findCommsFor(join, sendsMap) {
  return helper(join.actions, sendsMap);

  function helper(actions, sendsMap) {
    // Terminating case for the recursion
    if (actions.size === 0) {
      return [];
    }

    // Otherwise start making matches
    let finds = [];
    for (let actionIndex in actions) {
      const action = actions[actionIndex];
      const remainingActions = actions.slice(0,actionIndex).concat(actions.slice(actionIndex + 1));
      const compatibleSends = findSubCommsFor(action, sendsMap);

      for (let send of compatibleSends.values()) {
        const remainingSends = sendsMap.update(action.chan, (old) => old.remove(send));

        remnantMatches = helper(remainingActions, remainingSends);
        finds.push([send].concat(remnantMatches));
      }
    }
  return finds;
  }
}

/**
 * Finds all sends that subComm with the given action.
 * @param a single action
 * @param sendsMap A map from channels to sends on those channels
 *          in the style of the tuplespace
 * @return An immutable Set of all usable sends
 */
function findSubCommsFor(action, sendsMap) {
  return sendsMap.get(action.chan, Set()).filter((send) => subcommable(action, send) !== false);
}

/**
 * Turns any rholang term (atm mostly ground terms)into a
 * reasonable looking string preresentation.
 *
 * @param term The term to be rendered
 * @return A string version of the supplied term
 */
function prettyPrint(term) {
  switch (term.tag) {
    case "ground":
      switch (term.type) {
        case "string":
          return term.value;

        case "bool":
        case "int":
          return JSON.stringify(term.value)

        default:
          throw "Non-exhaustive pattern match in prettyPrintern ground types: " + term.type;
      }

    case "send":
      return "@" + prettyPrint(term.chan) + "!(" + prettyPrint(term.message) + ")";

    default:
      throw "Non-exhaustive pattern match in prettyPrint: " + term.tag;
  }
}
