const { Map, Set } = require("immutable");
const rhoVM = require('../rhoVM.js');
const { randomBytes } = require('tweetnacl');
const { nilAst, intAst, sendAst, send2Ast } = require('./trees.js');

// TODO setup method? I would prefer to construct the fresh tuplespace there.
const empty = {
  procs: Map(),
  sends: Map(),
  joins: Map(),
};

// Test Empty tuplespaces
test('Fresh 1', () => {
  const fresh = rhoVM.fresh();

  expect(fresh).toEqual(empty);
});

test('Nil', () => {
  const ts = rhoVM.fresh();

  const ts2 = rhoVM.deploy(ts, nilAst, new Uint8Array([1,2,3]));

  expect(ts2).toEqual(empty);
});

// Test parring terms in
test('Par in one send', () => {
  const ts = rhoVM.fresh();

  const ts2 = rhoVM.deploy(ts, sendAst, new Uint8Array([1,2,3]));

  expect(ts2.procs.count()).toEqual(1);
  expect(ts2.sends.count()).toEqual(1);
  expect(ts2.joins.count()).toEqual(0);
});

test('Par in same send twice', () => {
  const ts = rhoVM.fresh();

  const ts2 = rhoVM.deploy(ts, sendAst, new Uint8Array([1,2,3]));
  const ts3 = rhoVM.deploy(ts2, sendAst, new Uint8Array([2,3,4]));

  expect(ts3.procs.count()).toEqual(2);
  expect(ts3.sends.count()).toEqual(1);
  expect(ts2.joins.count()).toEqual(0);
});

test('Par in two different sends', () => {
  const ts = rhoVM.fresh();

  const ts2 = rhoVM.deploy(ts, sendAst, new Uint8Array([1,2,3]));
  const ts3 = rhoVM.deploy(ts2, send2Ast, new Uint8Array([2,3,4]));

  expect(ts3.procs.count()).toEqual(2);
  expect(ts3.sends.count()).toEqual(2);
  expect(ts2.joins.count()).toEqual(0);
});

test('Par in one send, one ground', () => {
  const ts = rhoVM.fresh();

  const ts2 = rhoVM.deploy(ts, sendAst, new Uint8Array([1,2,3]));
  const ts3 = rhoVM.deploy(ts2, intAst, new Uint8Array([2,3,4]));

  expect(ts3.procs.count()).toEqual(1);
  expect(ts3.sends.count()).toEqual(1);
  expect(ts2.joins.count()).toEqual(0);
});

test('Par in a Par of two sends', () => {
  const ts = rhoVM.fresh();

  const parAst = {
    tag: "par",
    procs: [sendAst, sendAst],
  }

  const ts2 = rhoVM.deploy(ts, parAst, new Uint8Array([1,2,3]));

  expect(ts2.procs.count()).toEqual(2);
  expect(ts2.sends.count()).toEqual(1);
  expect(ts2.joins.count()).toEqual(0);
});

// Par in single-action join

// Par in multiple action join

// Par in partially-overlapping joins
