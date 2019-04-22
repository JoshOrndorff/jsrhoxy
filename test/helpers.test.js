const { nilAst, sendAst, send2Ast, forXAst, intAst } = require('./trees.js');
const { evaluateInEnvironment, findSubCommsFor, findCommsFor, structuralHash } = require('../src/helpers.js');
const { Map, Set } = require('immutable');
const rhoVM = require('../src/rhoVM.js');

let vm;
beforeEach(() => {
  vm = rhoVM();
})

test('evaluating does not mutate sends', () => {
  const shallowCopy = {...sendAst};

  const evaluated = evaluateInEnvironment(sendAst, {});

  const relevantProperties = ["tag", "chan", "message"];

  // Ensure all the properties we care about are still the same references.
  for (let prop of relevantProperties) {
    expect(sendAst[prop]).toEqual(shallowCopy[prop]);
  }
});

//TODO evaluate in environment doesn't mutate joins

// TODO Above could/should be re-written in terms of objects coming back from
// makeConcrete are frozen. Object.isFrozen(result)


// Tests for finding Comms given a join
test('Find comm given join', () => {
  const join = evaluateInEnvironment(forXAst, {});

  vm.deploy(sendAst, 1);
  vm.deploy(send2Ast, 2);

  // There should be one comm
  const foundComms = findCommsFor(join, vm.sendsByChan());
  expect(foundComms.length).toBe(1);

  // There should be one send in the comm
  const foundSends = foundComms[0];
  expect(foundSends.length).toBe(1);

  // It should be the send we expected
  const foundSend = foundSends[0];
  const expected = evaluateInEnvironment(sendAst, {});

  //TODO Figure out how to use .equals with jest
  //expect(foundSend).toEqual(expected); // This one fails.
  expect(foundSend.equals(expected)).toBe(true);
});



// Tests for finding subcomms
test('Find basic subcomm', () => {
  const action = evaluateInEnvironment(forXAst, {}).actions[0];

  vm.deploy(sendAst, 1);
  vm.deploy(send2Ast, 2);

  const foundSends = findSubCommsFor(action, vm.sendsByChan());

  expect(foundSends).toEqual(Set([evaluateInEnvironment(sendAst, {})]));
});

test('No subcomms 1', () => {
  const action = evaluateInEnvironment(forXAst, {}).actions[0];

  vm.deploy(send2Ast, 2);

  const foundSends = findSubCommsFor(action, vm.sendsByChan());

  expect(foundSends).toEqual(Set());
});

test('No subcomms 2', () => {
  const action = evaluateInEnvironment(forXAst, {}).actions[0];

  vm.deploy(send2Ast, 2);
  const foundSends = findSubCommsFor(action, Map());

  expect(foundSends).toEqual(Set());
});


// Tests for structural equivalence
test('Same integers are structurally equivalent', () => {
  const i1 = {
    tag: "ground",
    type: "int",
    value: 5
  };
  const i2 = { ...i1 };

  expect(structuralHash(i1)).toBe(structuralHash(i2));
})

test('Different integers are NOT structurally equivalent', () => {
  const intTemplate = {
    tag: "ground",
    type: "int"
  };
  const i1 = { ...intTemplate, value: 5}
  const i2 = { ...i1, value:6 };

  expect(structuralHash(i1)).not.toBe(structuralHash(i2));
})

test('Unforgeables NOT structurally equivalent to ints', () => {
  const template = {
    tag: "ground",
    value: 20,
  };
  const g1 = { ...template, type: "int"}
  const g2 = { ...template, type: "unforgeable"};

  expect(structuralHash(g1)).not.toBe(structuralHash(g2));
})

test('sends with different channels are not structequiv', () => {
  const s1 = { tag: "send", chan: nilAst, message: nilAst};
  const s2 = { tag: "send", chan: intAst, message: nilAst};

  expect(structuralHash(s1)).not.toBe(structuralHash(s2));
})

test('sends with different messages are not structequiv', () => {
  const s1 = { tag: "send", chan: nilAst, message: nilAst};
  const s2 = { tag: "send", chan: nilAst, message: intAst};

  expect(structuralHash(s1)).not.toBe(structuralHash(s2));
})

test('send and for not structequiv', () => {
  expect(structuralHash(sendAst)).not.toBe(structuralHash(forXAst));
})

// Tests for equals
test('Equals distinguishes randomState', () => {
  let g1 = { ...nilAst, randomState: 1};
  let g2 = { ...nilAst, randomState: 2};
  g1 = evaluateInEnvironment(g1, {});

  expect(structuralHash(g1)).toBe(structuralHash(g2));
  expect(g1.equals(g2)).toBe(false);
})
