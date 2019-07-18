const { List } = require("immutable");
const rhoVM = require('../src/rhoVM.js');
const { evaluateInEnvironment } = require('../src/helpers.js');
const { nilAst, intAst, sendAst, send2Ast, forXAst, forXyAst, newXInXAst } = require('./trees.js');

let vm;
beforeEach(() => {
  // Pure does not populate the standard registy and system ffi
  vm = rhoVM.pure();

  // This makes a standard working tuplespace
  //vm = rhoVM();
});

// Test Empty tuplespaces
test('Fresh Tuplespace', () => {
  expect(vm.isEmpty()).toBe(true);
});

test('Nil', () => {
  vm.deploy(nilAst, 1);
  expect(vm.isEmpty()).toBe(true);
});

// Test parring sends in
test('Par in one send', () => {
  vm.deploy(sendAst, 1);

  const concreteChan = evaluateInEnvironment(sendAst.chan, {});

  expect(vm.containsTerm(sendAst)).toBe(true);
  expect(vm.joinsByChan().count()).toEqual(0);
});

test('Par in same send twice', () => {
  vm.deploy(sendAst, 1);
  vm.deploy(sendAst, 2);

  const concreteChan = evaluateInEnvironment(sendAst.chan, {});

  expect(vm.sendsByChan().get(concreteChan).size).toBe(2);
  expect(vm.joinsByChan().count()).toEqual(0);
});

test('Ensure value-equality semantics for channels in tuplespace', () => {
  // First just make sure we can clone properly
  let sendClone = { ...sendAst };
  sendClone.chan = { ... nilAst };
  expect(sendClone.chan === sendAst.chan).toBe(false);

  // Deploy the clones
  vm.deploy(sendAst, 123);
  vm.deploy(sendClone, 234);

  // Build a concrete @Nil channel
  const concreteNil = evaluateInEnvironment(nilAst, {})

  // Make sure both went onto the same channel
  expect(vm.sendsByChan().get(concreteNil).size).toBe(2);
  expect(vm.joinsByChan().count()).toEqual(0);
})

test('Par in two different sends', () => {
  vm.deploy(sendAst, 123);
  vm.deploy(send2Ast, 234);

  expect(vm.sendsByChan().count()).toEqual(2);
  expect(vm.joinsByChan().count()).toEqual(0);
});

test('Par in one send, one ground', () => {
  vm.deploy(sendAst, 123);
  vm.deploy(intAst, 234);

  expect(vm.sendsByChan().count()).toEqual(1);
  expect(vm.joinsByChan().count()).toEqual(0);
});


// Test parring pars in
test('Par in a Par of two sends', () => {
  const parAst = {
    tag: "par",
    procs: [sendAst, sendAst],
  }

  vm.deploy(parAst, 123);

  expect(vm.sendsByChan().count()).toEqual(1);
  expect(vm.joinsByChan().count()).toEqual(0);
});

test('Par in a send inside a new', () => {
  const newSendAst = {
    tag: "new",
    vars: [{
      tag: "variable",
      givenName: "x",
    }],
    body: sendAst,
  }

  vm.deploy(newSendAst, 123);

  expect(vm.sendsByChan().count()).toEqual(1);
  expect(vm.joinsByChan().count()).toEqual(0);
});


// Test parring joins in
test('Par in a single-action join', () => {

  vm.deploy(forXAst, 123);

  expect(vm.sendsByChan().count()).toEqual(0);
  expect(vm.joinsByChan().count()).toEqual(1);
  expect(vm.containsTerm(forXAst)).toBe(true);
});


test('Par in a multi-action join', () => {

  vm.deploy(forXyAst, 123);

  expect(vm.sendsByChan().count()).toEqual(0);
  expect(vm.joinsByChan().count()).toEqual(2);
});

test('Par in a bound variable', () => {

  //new x in { x }
  vm.deploy(newXInXAst, 123);

  expect(vm.sendsByChan().count()).toEqual(0);
  expect(vm.joinsByChan().count()).toEqual(0);
});

test('Par in an unbound variable', () => {

  //new x in { y }
  let newXInY = {...newXInXAst};
  newXInY.body = {
    tag: "variable",
    givenName: "y"
  }

  expect(() => {
    vm.deploy(newXInY, 123);
  }).toThrow("Variable y not bound in environment");
});

//TODO Par in partially-overlapping joins
