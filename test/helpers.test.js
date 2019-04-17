const { nilAst, sendAst, send2Ast, forXAst } = require('./trees.js');
const { evaluateInEnvironment, findSubCommsFor, findCommsFor } = require('../src/helpers.js');
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

// evaluate in environment doesn't mutate joins

// Same integers are structEquiv
// Different integers are not struct equiv

// Tests for finding Comms given a join
test('Find comm given join', () => {
  const join = evaluateInEnvironment(forXAst, {});

  vm.deploy(sendAst, 1);
  vm.deploy(send2Ast, 2);

  const foundSends = findCommsFor(join, vm.sendsByChan());

  expect(foundSends[0]).toEqual([evaluateInEnvironment(sendAst, {})]);
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
