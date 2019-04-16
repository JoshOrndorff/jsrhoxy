const { Map, Set, List } = require('immutable');
const { hash } = require('tweetnacl');
const { evaluateInEnvironment, commable, structEquiv } = require('./helpers.js');
const { splitRandom, mergeRandom } = require('../src/jankyCrypto.js');


module.exports = () => fresh(standardRegistry, standardFfis);
module.exports.pure = () => fresh({}, {});

const standardRegistry = {
  'rho:io:stdout': 0,
  'rho:io:stdoutAck': 1,
  'rho:io:stderr': 2,
  'rho:io:stderrAck': 3,
};

const standardFfis = [
  {
    tag: "join*",
    persistence: 999, //Hack; Only 999 stdout prints can happen in vm
    actions: [
      {
        tag: "action",
        pattern: {
          tag: "variableP",
          givenName: "msg",
        },
        chan: {
          tag: "ground",
          type: "unforgeable",
          value: standardRegistry['rho:io:stdout'],
        }
      }
    ],
    body: (bindings) => {console.log(bindings.get("msg"))}
  },
  {
    tag: "join*",
    persistence: 999,
    actions: [
      {
        tag: "action",
        pattern: {
          tag: "variableP",
          givenName: "msg",
        },
        chan: {
          tag: "ground",
          type: "unforgeable",
          value: standardRegistry['rho:io:stderr'],
        },
      }
    ],
    body: (bindings) => {console.error(bindings.msg)}
  }
]

/**
 * Construct a fresh empty instance of the rho virtual machine.
 * @param reg Object representing initial registry entries
 * @param ffis Array of foreign functions to be added to the tuplespace
 * @return interface for interacting with vm
 */
function fresh(reg, ffis) {
  let procs = Map();
  let sends = Map();
  let joins = Map();
  let registry = (typeof(reg) === "undefined") ? Map({}) : Map(reg);

  // Go through and put all of the ffis in place
  for (let i = 0; i < ffis.length; i++) {
    let ffi = ffis[i];
    if (ffi.tag !== "send*" && ffi.tag !== "join*") {
      throw "Only join* and send* ffis are supported";
    }

    parIn(ffi, {}, i);
  }

  return {
    isEmpty,
    deploy,
    executeComm,
    containsTerm,
    tuplespaceById: () => Map(procs),
    sendsByChan: () => Map(sends),
    joinsByChan: () => Map(joins),
  };

  /**
   * Check whether a particular rholang term is in the tuplespace
   *
   * Term passed in must be fully concrete
   */
  function containsTerm(term) {
    switch (term.tag) {
      case "send":
      case "send*":
        return sends.get(term.chan).has(term);

      case "join":
      case "join*":
        // Only need to look it up by one channel
        return joins.get(term.actions[0].chan).has(term);

      case "ground":
      case "par":
      case "bundle":
      case "new":
        throw "Only sends and joins are stored in the tuplespace, not: " + term.tag;

      default:
        throw "Non-exhaustive pattern match in containsTerm.";
    }
  }

  /**
   * Tells whether the tuplespace is empty
   */
  function isEmpty() {
    if (procs.count() !== 0) {
      return false;
    }

    for (let idSet of sends.values()) {
      if (idSet.size !== 0){
        return false;
      }
    }

    for (let idSet of joins.values()) {
      if (idSet.size !== 0){
        return false;
      }
    }

    return true;
  }

  /**
   * Takes in rholang AST and deploys it to a tuplespace.
   * Basically just a wrapper around parIn
   * that sets up the empty environment and random state.
   * @param term An AST of the rholang term to be deployed
   * @param seed A seed for the random state
   * @return The same tuplespace mutated
   * @throws Parese errors
   */
  function deploy(term, seed) {
    //TODO since registry lookups only happen at the topmost level
    // in rhoxy, handle them here, then move on the parIn

    // TODO eventually we'll want to hash the seed, but for now it's useful
    // to manually assign ids.
    return parIn(term, {}, seed);
  }

  /**
   * Update the tuplespace by parring in a term
   * @param term An AST of the term to be parred in
   * @param env The environment in which the term should be evaluated.
   * @param randomState Random state (integer) for the term.
   */
  function parIn(term, env, randomState) {
    switch (term.tag) {

      case "ground":
        break;

      case "bundle":
        parIn(randomState, term.proc);
        break;

      case "send*": // For FFIs akin stdout (maybe date or entropy)
      case "send": {
        // Must be fully concrete to enter tuplespace, so evaluate now
        let concreteSend = evaluateInEnvironment(term, env);
        concreteSend.id = randomState;
        procs = procs.set(randomState, concreteSend);

        // https://immutable-js.github.io/immutable-js/docs/#/Map/update
        // update(key: K, notSetValue: V, updater: (value: V) => V): this
        const updater = (old) => old.add(randomState);
        sends = sends.update(concreteSend.chan, Set(), updater);
        break;
      }

      case "join*": // For FFIs like stdout
      case "join":
        let concreteJoin = evaluateInEnvironment(term, env);
        concreteJoin.id = randomState;
        concreteJoin.environment = env;
        procs = procs.set(randomState, concreteJoin);

        // Now go through and put each channel in the map
        for (let {chan} of term.actions) {
          const updater = (old) => old.add(randomState);
          joins = joins.update(chan, Set(), updater);
        }
        break;


      case "par":
        const ps = term.procs;
        let nextStates = splitRandom(randomState, ps.length);
        // Would be nice to have zip
        for (let i = 0; i < ps.length; i++) {
          parIn(ps[i], env, nextStates[i]);
        }
        break;


      case "new": {
        let newBindings = {};
        const vs = term.vars;
        let nextStates = splitRandom(randomState, vs.length + 1);
        for (let i = 0; i < vs.length; i++) {
          newBindings[vs[i]] = {
            tag: "ground",
            type: "unforgeable",
            value: nextStates[i],
          };
        }

        // Then recurse adding those bindings to the environment
        return parIn(term.body, {...env, ...newBindings}, nextStates[vs.length]);
      }
    }
  }


  /**
   * Performs a single comm reduction on a tuplespace
   * @param joinId Id of the join to be commed
   * @param sendIds List of Ids of sends to be commed
   * @return A new tuplespace updated according to the reduction
   * @throws If the comm supplied is not valid
   */
  function executeComm(joinId, sendIds) {

    // Grab the join and send objects from the tuplespace
    const commJoin = procs.get(joinId);
    const commSends = sendIds.map(sId => procs.get(sId));

    // Make sure the specified processes are actually commable, and
    // get the new bindings
    const bindings = commable(new Set(commJoin.actions), new Set(commSends));
    if (bindings === false) {
      throw "Invalid comm requested.";
    }

    // Figure out which IDs to remove from the tuplespace
    const allIds = Set(sendIds.concat([joinId])).filter(removable);
    function removable(id) {
      let p = procs.get(id);
      return p.persistence === undefined || p.persistence-- === 0;
    }

    // Not sure what's up with the v, k ordering
    // https://immutable-js.github.io/immutable-js/docs/#/Set/subtract
    procs = procs.deleteAll(allIds);
    sends = sends.map((v, k) => v.subtract(allIds));
    joins = joins.map((v, k) => v.subtract(allIds));


    // Calculate the new random state.
    const newRandom = mergeRandom(allIds)

    // Handle all of the system sends
    for (let send of commSends.filter(x => x.tag === "send*")) {
      //TODO
    }

    if (commJoin.tag === "join*") {
      // Call the system function
      commJoin.body(bindings);
    }
    else {
      // Add the new stuff into the tuplespace
      // Merge objects with spread operator https://stackoverflow.com/a/171256/4184410
      parIn(commJoin.body, {...commJoin.environment, ...bindings}, newRandom);
    }
  }


//BIG TODO I suspect all of this logic about finding comms will
// look very similar to executing comms in the recursive traversal.
// I'd like to abstract the traversal of the tuplespace away into
// a helper and just supply find-related stuff here.
// The big difference is that here I want to return the correct
// IDs, and over there I want to return the correct bindings.
// Seems a lot like a different folding function


  /**
   * Inspects the tuplespace to find a single eligible comm event.
   * TODO maybe find all eligible comms
   *
   * @return (joinId, [sendIds])
   */
  function findComm() {

    // Loop through the joins
    for (let join of joins.values()) {

      // Loop thorugh the actions
      for (let action of join.actions) {


      }
    }
  }

  /**
   * Given a join, inspects the tuplespace for a set of sends that will comm with it
   */
  function findCommForJoin(join) {

  }

  /**
   * Given an action, searches the tuplespace for a compatible send
   * and returns its id.
   */
  function findSendForAction(action) {
    // Loop through all sends on the correct channel
    for (let send of sends.get(action.chan).values()) {
      if(patternMatch(action.pattern, send.message) !== false) {
        return send.id;
      }
      else {
        return false;
      }
    }
  }
}
