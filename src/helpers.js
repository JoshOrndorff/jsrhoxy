const { patternMatch } = require('./patternMatcher.js');
const { Map, List } = require('immutable');
const { qdHash, mergeRandom } = require('tweetnacl');

module.exports = {
  evaluateInEnvironment,
  mergeRandom, // re-export from jankyCrypto
  commable,
  structEquiv,
}

/**
 * Given an AST, returns a fully concrete version of the same AST.
 * All variables will have been looked up in the appropriate environment.
 * Finally, .equals() and  .hashCode() methods will be attached for proper
 * insertion into the tuplespace.
 *
 * @param term The term to be made concrete
 * @param env The environment bindings to use
 * @return Concrete AST with .hashCode method
 */
function evaluateInEnvironment (term, env) {
  let result;

  switch (term.tag) {

    case "unforgeable":
    case "ground":
      result = term;
      break;

    case "variable": {
      result = env[term.givenName];
      break;
    }

    case "send*":
    case "send":
      result = {
        tag: "send",
        chan: evaluateInEnvironment(term.chan, env),
        message: evaluateInEnvironment(term.message, env),
      }
      break;


    case "join*":
    case "join": {
      // Make each action's channel concrete
      let concreteActions = [];
      for (let action of term.actions) {
        concreteAction = {
          tag: "action",
          chan: evaluateInEnvironment(action.chan, env),
          pattern: action.pattern,
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
        // It's getting tedious to copy each element this way.
        result = {
          tag: term.tag,
          actions: concreteActions,
          continuation: term.continuation, // normal joins
          body: term.body, // join*s
          persistence: term.persistence,
        };
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
  return {
    ...result,
    equals: (other) => structEquiv(term, other),
    hashCode: hashTerm,
  };
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

  // Bundles don't affect structural equivalence
  if (a.tag === 'bundle') {
    return structEquiv(a.proc, b);
  }

  if (b.tag === 'bundle') {
    return structEquiv(a, b.proc);
  }

  // If tags are different, we can short-circuit
  if (a.tag !== b.tag) {
    return false;
  }
  // Ground Terms
  if (a.tag === "ground") {
    return a.type === b.type && a.value === b.value;
  }

  // Sends
  if (a.tag === "send") {
    return structEquiv(a.chan, b.chan) && structEquiv(a.message, b.message);
  }

  // Joins
  if (a.tag === "join") {
    //TODO
    // check for same number of actions and fail fast if different
    // O(n^2) check to see if they pair up correctly
  }

  // Pars
  if (a.tag === "par") {
    //TODO
    // flatten nested pars and remove all the ground terms
    // then check whether lengths are equal and fail-fast if not
    // then O(n^2) check for valid matchings
  }

  // Unforgeables
  if (a.tag === "unforgeable") {
    return a.id === b.id;
  }

  // Should never get here if all valid tags above were checked
  throw "Non-exhaustive pattern match in structEquiv:" + a.tag;
}


/**
 * Computes the hashcode of a given term for purposes
 * of using in immutable js libraries.
 *
 * TODO: Should same hashCode mean structurally equivalent?
 *
 * Terms being passed in here must be fully concrete so that
 * there are no free variable mentions.
 * @param the term to hash
 * @return the hashcode (number? what type?)
 */
function hashTerm(term) {
  return 0;
  // Worst hashcode ever. All items will collide. O(n) lookups.
  //TODO This next
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
