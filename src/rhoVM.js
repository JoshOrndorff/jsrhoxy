const { Map, Set, List } = require('immutable');
const { hash } = require('tweetnacl');
const { evaluateInEnvironment, commable, structEquiv } = require('./helpers.js');
const { splitRandom, mergeRandom } = require('../src/jankyCrypto.js');
const ffis = require('./ffi.js');


module.exports = () => fresh(ffis);
module.exports.pure = () => fresh([]);


/**
 * Construct a fresh instance of the rho virtual machine.
 * @param ffis Object of functions to be added to the tuplespace and registry.
 * @return interface for interacting with vm
 */
function fresh(ffis) {
  let sends = Map();
  let joins = Map();
  let registry = Map();

  // Go through and put all of the ffis in place
  let i = 0;
  for (let ffi of ffis) {
    const nextChan = {tag: "ground", type: "unforgeable", value: i};

    switch (ffi.tag) {
      case "send*":
        throw "FFI sends, not yet supported";
        break;

      case "join*":
        for (let action of ffi.actions) {
          const uri = action.chan;
          action.chan = nextChan;
          const concreteChan = evaluateInEnvironment({ ...nextChan}, {});
          registry = registry.set(uri, concreteChan);
        }
        break;

      default:
        throw "Only join* and send* ffis are supported";
    }

    // Need some initial random state, may as well use the first index in the proc.
    // Add 1000 to avoid confilct with hardcoded randomStates used for tests right now.
    parIn(ffi, {}, 1000 + i);
    i += 1;
  }

  return {
    isEmpty,
    deploy,
    executeComm,
    containsTerm,
    sendsByChan: () => Map(sends),
    joinsByChan: () => Map(joins),
    getArbitraryJoin: () => joins.first().first(),
  };

  /**
   * Check whether the tuplespace contains any process structurally
   * equivalent to the one supplied.
   *
   * Term passed in must be fully concrete
   */
  function containsTerm(term) {
    switch (term.tag) {
      case "send":
      case "send*":
        const sChan = evaluateInEnvironment(term.chan, {});
        const sCandidates = sends.get(sChan);
        return sCandidates.filter((x) => structEquiv(x, term)).size > 0;

      case "join":
      case "join*":
        // Only need to look it up by one channel
        const jChan = evaluateInEnvironment(term.actions[0].chan, {});
        const jCandidates = joins.get(jChan);
        return jCandidates.filter((x) => structEquiv(x, term)).size > 0;

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
        term.randomState = randomState;
        let concreteSend = evaluateInEnvironment(term, env);

        // https://immutable-js.github.io/immutable-js/docs/#/Map/update
        // update(key: K, notSetValue: V, updater: (value: V) => V): this
        const updater = (old) => old.add(concreteSend);
        sends = sends.update(concreteSend.chan, Set(), updater);
        break;
      }

      case "join*": // For FFIs like stdout
      case "join":
        term.randomState = randomState;
        term.environment = env;
        let concreteJoin = evaluateInEnvironment(term, env);

        // Now go through and put each channel in the map
        for (let {chan} of concreteJoin.actions) {
          const updater = (old) => old.add(concreteJoin);
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
   * @param commJoin The join to be commed
   * @param commSends List of sends to be commed
   * @throws If the comm supplied is not valid
   */
  function executeComm(commJoin, commSends) {


    // Make sure the specified processes are actually commable, and
    // get the new bindings
    const bindings = commable(new Set(commJoin.actions), new Set(commSends));
    if (bindings === false) {
      throw "Invalid comm requested.";
    }

    // Figure out which IDs to remove from the tuplespace
    const allParents = Set(commSends.concat([commJoin]));
    const removable = allParents.filter(isRemovable);
    function isRemovable(p) {
      return (p.persistence === undefined || p.persistence-- === 0);
    }

    // Not sure what's up with the v, k ordering
    // https://immutable-js.github.io/immutable-js/docs/#/Set/subtract
    sends = sends.map((v, k) => v.subtract(removable));
    joins = joins.map((v, k) => v.subtract(removable));

    // Calculate the new random state.
    const newRandom = mergeRandom(allParents.map((parent) => parent.randomState))

    // Handle all of the system sends
    for (let send of commSends.filter(x => x.tag === "send*")) {
      //TODO
    }

    // Handle the system receives
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
}
