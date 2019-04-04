const { Map, Set } = require("immutable");
const rhoVM = require('../src/rhoVM.js');
const { nilAst, intAst, sendAst, send2Ast, forXAst, forXyAst } = require('./trees.js');


let ts;
beforeEach(() => {
  ts = rhoVM.fresh();
});

// Test Empty tuplespaces
test('Fresh Tuplespace', () => {
  expect(rhoVM.isEmpty(ts)).toBe(true);
});

test('Nil', () => {
  const ts2 = rhoVM.deploy(ts, nilAst, new Uint8Array([1,2,3]));

  expect(rhoVM.isEmpty(ts2)).toBe(true);
});

// Test parring sends in
test('Par in one send', () => {
  const ts2 = rhoVM.deploy(ts, sendAst, new Uint8Array([1,2,3]));

  expect(ts2.procs.count()).toEqual(1);
  expect(ts2.sends.count()).toEqual(1);
  expect(ts2.joins.count()).toEqual(0);
});

test('Par in same send twice', () => {
  const ts2 = rhoVM.deploy(ts, sendAst, new Uint8Array([1,2,3]));
  const ts3 = rhoVM.deploy(ts2, sendAst, new Uint8Array([2,3,4]));

  expect(ts3.procs.count()).toEqual(2);
  expect(ts3.sends.count()).toEqual(1);
  expect(ts2.joins.count()).toEqual(0);
});

test('Par in two different sends', () => {
  const ts2 = rhoVM.deploy(ts, sendAst, new Uint8Array([1,2,3]));
  const ts3 = rhoVM.deploy(ts2, send2Ast, new Uint8Array([2,3,4]));

  expect(ts3.procs.count()).toEqual(2);
  expect(ts3.sends.count()).toEqual(2);
  expect(ts2.joins.count()).toEqual(0);
});

test('Par in one send, one ground', () => {
  const ts2 = rhoVM.deploy(ts, sendAst, new Uint8Array([1,2,3]));
  const ts3 = rhoVM.deploy(ts2, intAst, new Uint8Array([2,3,4]));

  expect(ts3.procs.count()).toEqual(1);
  expect(ts3.sends.count()).toEqual(1);
  expect(ts2.joins.count()).toEqual(0);
});


// Test parring pars in
test('Par in a Par of two sends', () => {
  const parAst = {
    tag: "par",
    procs: [sendAst, sendAst],
  }

  const ts2 = rhoVM.deploy(ts, parAst, new Uint8Array([1,2,3]));

  expect(ts2.procs.count()).toEqual(2);
  expect(ts2.sends.count()).toEqual(1);
  expect(ts2.joins.count()).toEqual(0);
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

  const ts2 = rhoVM.deploy(ts, newSendAst, new Uint8Array([1,2,3]));

  expect(ts2.procs.count()).toEqual(1);
  expect(ts2.sends.count()).toEqual(1);
  expect(ts2.joins.count()).toEqual(0);
});


// Test parring joins in
test('Par in a single-action join', () => {

  const ts2 = rhoVM.deploy(ts, forXAst, new Uint8Array([1,2,3]));

  expect(ts2.procs.count()).toEqual(1);
  expect(ts2.sends.count()).toEqual(0);
  expect(ts2.joins.count()).toEqual(1);
});


test('Par in a multi-action join', () => {

  const ts2 = rhoVM.deploy(ts, forXyAst, new Uint8Array([1,2,3]));

  expect(ts2.procs.count()).toEqual(1);
  expect(ts2.sends.count()).toEqual(0);
  expect(ts2.joins.count()).toEqual(2);
});

// Par in partially-overlapping joins
