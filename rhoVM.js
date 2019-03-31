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
 * Takes in a string of rholang code, parses it, and deploys it
 * to a tuplespace. Basically just a wrapper around addToTuplespace
 * that sets up the empty environment.
 * @param ts The tuplespace to deploy to
 * @param term An AST of the rholang term to be deployed
 * @param seed
 * @return The same tuplespace mutated
 * @throws Parese errors
 */
module.exports.deploy = deploy;
function deploy(ts, term, seed) {
  //console.log(hash(seed));
  return parIn(ts, {}, seed, term);
}

/**
 * Update the tuplespace by parring in a term
 * @param ts The tuplespace prestate
 * @param environment Bindings that term needs to retain
 * @param randomState Random state to seed Ids
 * @param term An AST of the term to be parred in
 * @return the same tuplespace mutated.
 */
module.exports.parIn = parIn
function parIn(ts, env, randomState, term) {
  switch (term.tag) {

    case "ground":
      return ts;

    case "bundle":
      return parIn(ts, env, randomState, term.proc);

    //TODO At some point around here, I need to actually look
    // up values in environments. At least the channels should be fully subbed in.
    // Or maybe sends coming in here should already be fully concretified?
    case "send": {
      term.env = env;
      let poststate = {};
      poststate.procs = ts.procs.set(randomState, term);
      if (ts.sends.has(term.chan)) {
        poststate.sends = ts.sends.set(term.chan, ts.sends.get(term.chan).add(randomState));
      }
      else {
        poststate.sends = ts.sends.set(term.chan, Set([randomState]));
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

    case "par":
      //TODO
      break;
   }

 }
