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
  // List of all joins (not indexed by channel)
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
module.exports.parIn = parIn
function parIn(ts, term, env, randomState) {
  switch (term.tag) {

    case "ground":
      return ts;

    case "bundle":
      return parIn(ts, randomState, term.proc);

    //TODO At some point around here, I need to actually look
    // up values in environments. At least the channels should be fully subbed in.
    // Or maybe sends coming in here should already be fully concretified?
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
          poststate.joins = ts.joins.set(chan, ts.sends.get(chan).add(randomState));
        }
        else {
          poststate.sends = ts.sends.set(chan, Set([randomState]));
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
      hashCode: () => (0),
    }
  }

  if (term.tag === "join") {
    //TODO make each action's channel concrete
    let concreteActions = {};
    //TODO make sure there aren't any free variables in the continuation??
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

 }
