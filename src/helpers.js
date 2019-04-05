const { patternMatch } = require('./patternMatcher.js');
const { Map, List } = require('immutable');
const { hash } = require('tweetnacl');

module.exports = {
  evaluateInEnvironment,
  mergeRandom,
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
    case "ground": {
      result = term;
      break;
    }

    case "variable": {
      result = env[term.givenName];
      break;
    }

    case "send": {
      result = {
        tag: "send",
        chan: evaluateInEnvironment(term.chan, env),
        message: evaluateInEnvironment(term.message, env),
      }
      break;
    }

    case "join": {
      // Make each action's channel concrete
      let concreteActions = {};
      //TODO loop through the actions and recursively call evaluate in environment

      // Make sure there aren't any free variables in the continuation??
      if ((freeNames(term.continuation).length === 0)) {
        result = {
          tag: "join",
          actions: concreteActions,
          continuation: term.continuation,
        }
      }
      else {
        throw "Free names not allowed in continuation.... TODO figure out exactly what this message should say."
      }
      break;
    }

    default:
      throw "Non-exhaustive pattern match in evaluateInEnvironment.";
  }

  // Tack on the methods and return.
  return {
    ...result,
    equals: (other) => structEquiv(term, other),
    hashCode: () => 0, // Worst hashcode ever. All items will collide. O(n) lookups.
  };
}

/**
 * Poor man's probably-inseucre-af mergeable random state.
 * Merges many random states into one.
 * Use at your own risk, not audited, not for production, blah blah blah
 *
 * https://stackoverflow.com/a/49129872/4184410
 *
 * @param initials The initial states to merge. Should be immutable Lists
 *                 that will convert successfully to Uint8Arrays.
 * @return A new pseudo-random-ish state
 */
function mergeRandom(initials) {

  // Get the total length of all arrays.
  let length = 0;
  initials.forEach(item => {
    length += item.size;
  });

  // Create a new array with total length and merge all source arrays.
  let mergedArray = new Uint8Array(length);
  let offset = 0;
  initials.forEach(item => {
    mergedArray.set(new Uint8Array(item), offset);
    offset += item.length;
  });

  return List(hash(mergedArray));
}

/**
 * Make sure they are compatible (same channel, patterns match, etc)
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

    if (structEquiv(action.chan, send.chan)) {
      currentBindings = patternMatch(action.pattern, send.message);

      let remainingBindings = commable(actions.remove(action), sends.remove(send));

      if (remainingBindings !== false) {
        //TODO make sure the same name isn't used twice as a binder
        return remainingBindings.merge(currentBindings);
      }
    }

  }

  // No sends matched this action
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

  // Should never get here if all valid tags above were checked
  throw "Non-exhaustive pattern match in structEquiv.";
}
