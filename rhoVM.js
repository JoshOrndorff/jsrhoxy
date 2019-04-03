const { Map, Set } = require("immutable");
const { hash } = require("tweetnacl");

// Tuplespace type
// The numbers are a unique id / poor-mans-pseudo-random-state
// associated with each send or receive.  They will be hashes or something.
/*
{
  // A Map from id's to process ASTs
  procs: Map {
    123: {tag: "send", ...},
    234: {tag: "send", ...},
    345: {tag: "send", ...},
    567: {tag: "join", ...}
  },
  // A channel-indexed list of all sends
  sends: Map {
    chan1: Set [
      123
    ],
    chan2: Set [
      234,
      345
  ],
  // Channel-indexed list of all joins. There will be dupes, becuase
  // multi-action joins appear in multiple lists.
  joins: Map {
    chan1: Set[
      567
    ]
  }
}
*/

/**
 * Construct an empty tuplespace.
 * @return The new tuplespace
 */
module.exports.fresh = fresh;
function fresh() {
  return {
    procs: Map(),
    sends: Map(),
    joins: Map(),
  }
}

/**
 * Tells whether the given tuplespace is empty
 */
module.exports.isEmpty = isEmpty;
function isEmpty(ts) {
  if (ts.procs.count() !== 0) {
    return false;
  }

  for (let idSet of ts.sends.values()) {
    if (idSet.size !== 0){
      return false;
    }
  }

  for (let idSet of ts.joins.values()) {
    if (idSet.size !== 0){
      return false;
    }
  }

  return true;
}

/**
 *
 */
module.exports.tuplespaceToJson = tuplespaceToJson;
function tuplespaceToJson(ts) {
  throw "Exporting tuplespace to JSON, not yet implemented";
}

/**
 *
 */
module.exports.tuplespaceFromJson = tuplespaceFromJson;
function tuplespaceFromJson(ts) {
  throw "Importing tuplespace from JSON, not yet implemented";
}

/**
 * Takes in rholang AST and deploys it to a tuplespace.
 * Basically just a wrapper around addToTuplespace
 * that sets up the empty environment and random state.
 * @param ts The tuplespace to deploy to
 * @param term An AST of the rholang term to be deployed
 * @param seed A seed for the random state
 * @return The same tuplespace mutated
 * @throws Parese errors
 */
module.exports.deploy = deploy;
function deploy(ts, term, seed) {
  // TODO eventually we'll want to hash the seed, but for now it's useful
  // to manually assign ids.
  return parIn(ts, term, {}, seed);
}

/**
 * Update the tuplespace by parring in a term
 * @param ts The tuplespace prestate
 * @param term An AST of the term to be parred in
 * @param env The environment in which the term should be evaluated.
 * @param randomState Random state to seed Ids
 * @return the same tuplespace mutated.
 */
function parIn(ts, term, env, randomState) {
  switch (term.tag) {

    case "ground":
      return ts;

    case "bundle":
      return parIn(ts, randomState, term.proc);

    case "send": {
      // Sends should be fully concrete when they go into the tuplespace, so
      // get everything you need from the environment now.
      let concreteSend = evaluateInEnvironment(term, env);
      let poststate = {};
      poststate.procs = ts.procs.set(randomState, concreteSend);
      if (ts.sends.has(concreteSend.chan)) {
        poststate.sends = ts.sends.set(concreteSend.chan, ts.sends.get(concreteSend.chan).add(randomState));
      }
      else {
        poststate.sends = ts.sends.set(concreteSend.chan, Set([randomState]));
      }
      poststate.joins = ts.joins;
      return poststate;
    }

    case "join": {
      term.env = env;
      let poststate = {};
      poststate.procs = ts.procs.set(randomState, term);
      poststate.sends = ts.sends;
      poststate.joins = ts.joins;

      // Now go through and put each channel in the map
      for (let {chan} of term.actions) {
        if (ts.joins.has(chan)) {
          poststate.joins = poststate.joins.set(chan, ts.sends.get(chan).add(randomState));
        }
        else {
          poststate.joins = poststate.joins.set(chan, Set([randomState]));
        }
      }

      return poststate;
    }

    case "par": {
      // Par them all in sequentially.
      let tempTS = ts;
      let tempRandom = randomState;
      for (let proc of term.procs) {
        tempRandom = hash(tempRandom);
        tempTS = parIn(tempTS, proc, env, tempRandom);
      }
      return tempTS;
    }

    case "new": {
      let newBindings = {};
      // Generate new unforgeable ID for each new variable
      let tempRandom = randomState;
      for (let x of term.vars) {
        tempRandom = hash(tempRandom);
        newBindings[x] = tempRandom;
      }

      // Then recurse adding those bindings to the environment
      return parIn(ts, term.body, {...env, ...newBindings}, hash(tempRandom));
    }
  }
}

/**
 * Given an AST, returns a fully concrete version of the same AST.
 * All variables will have been looked up in the appropriate environment.
 * Finally, a .hashCode() method will be attached for proper insertion into
 * the tuplespace.
 * @param term The term to be made concrete
 * @param env The environment bindings to use
 * @return Concrete AST with .hashCode method
 */
function evaluateInEnvironment (term, env) {
  if (term.tag === "ground") {
    return term;
  }

  if (term.tag === "variable") {
    return env[term.givenName];
  }

  if (term.tag === "send") {
    return {
      tag: "send",
      chan: evaluateInEnvironment(term.chan, env),
      message: evaluateInEnvironment(term.message, env),
    }
  }

  if (term.tag === "join") {
    // Make each action's channel concrete
    let concreteActions = {};
    //TODO loop through the actions and recursively call evaluate in environment

    // Make sure there aren't any free variables in the continuation??
    if ((freeNames(term.continuation).length === 0)) {
      return {
        tag: "join",
        actions: concreteActions,
        continuation: term.continuation,
      }
    }
    else {
      throw "Free names not allowed in continuation.... TODO figure out exactly what this message should say."
    }
  }

  throw "Non exhaustive pattern match in evaluateInEnvironment.";
}

/**
 * Performs a single comm reduction on a tuplespace
 * @param ts The tutplespace in which the reduction will occur
 * @param joinId Id of the join to be commed
 * @param sendIds List of Ids of sends to be commed
 * @return A new tuplespace updated according to the reduction
 * @throws If the comm supplied is not valid
 */
module.exports.executeComm = executeComm;
function executeComm(ts, joinId, sendIds) {

  // Grab the join and send objects from the tuplespace
  const join = ts.procs.get(joinId);
  const sends = sendIds.map(sId => ts.procs.get(sId));

  // Make sure the specified processes are actually commable, and
  // get the new bindings
  const bindings = commable(new Set(join.actions), new Set(sends));
  if (bindings === false) {
    throw ("Invalid comm requested.")
  }

  // Remove consumed processes from the tuplespace
  const allIds = Set(sendIds.concat([joinId]));
  // DEVELOPMENT NOTE: At this point bindings and allIds are both correct.
  const reducedTS = {
    // Not sure what's up with the v, k ordering
    // https://immutable-js.github.io/immutable-js/docs/#/Set/subtract
    procs: ts.procs.deleteAll(allIds),
    sends: ts.sends.map((v, k) => v.subtract(allIds)),
    joins: ts.joins.map((v, k) => v.subtract(allIds)),
  };

  // Calculate the new random state.
  const newRandom = mergeRandom(allIds)

  // Add the new stuff into the tuplespace
  // Merge objects with spread operator https://stackoverflow.com/a/171256/4184410
  return parIn(reducedTS, join.body, {...join.environment, ...bindings}, newRandom);
}

/**
 * Poor man's probably-inseucre-af mergeable random state.
 * Merges many random states into one.
 * Use at your own risk, not audited, not for production, blah blah blah
 *
 * https://stackoverflow.com/a/49129872/4184410
 *
 * @param initials The initial states to merge. Should be Uint8Arrays
 * @return A new pseudo-random-ish state
 */
function mergeRandom(initials) {

  // Get the total length of all arrays.
  let length = 0;
  initials.forEach(item => {
    length += item.length;
  });

  // Create a new array with total length and merge all source arrays.
  let mergedArray = new Uint8Array(length);
  let offset = 0;
  initials.forEach(item => {
    mergedArray.set(item, offset);
    offset += item.length;
  });

  //console.log("preview of the merged random state");
  //console.log(hash(mergedArray));
  return hash(mergedArray);
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

    if (structEquiv(action.chan, send.chan) /*&& pattern matches*/) {
      // TODO the bindings should come from the pattern matcher
      // For now assume every pattern is a free variable.
      currentBindings = Map([[action.pattern.givenName, send.message]]);


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
