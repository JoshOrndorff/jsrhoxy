const rhoVM = require('../rhoVM.js');
const { randomBytes } = require('tweetnacl');
//const nearley = require("nearley");
//const grammar = require("../rhoxyGrammar.js");
const { nilAst, intAst, sendAst, send2Ast, forXAst, forXyAst } = require('./trees.js');


// Make a fresh tuplespace and parser for each test
let ts;
//let parser;
beforeEach(() => {
  ts = rhoVM.fresh();
  //parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
});

/**
 * Takes this rholang code, manually specifies the only possible comm event,
 * and ensures that the post state is correct (empty).
 *
 * @Nil!(Nil) |
 * for (x <- @Nil){ Nil }
 */
test('Most basic comm', () => {
  // Try making the ids consts incase there is some instance id shit going on here
  // Okay, so I get the correct join out of the tuplespace when I do this, but
  // not when I type the newUint8Array twice below. So that tells me the tuplespace
  // Maps are based on some kind on instance ID which is not what I want.
  // But bigger fish to fry right meow.
  // This should be fixed by starting over with a minimal example.
  const joinId = new Uint8Array([1]);
  const sendId = new Uint8Array([2]);

  // Deploy the pieces seperately to easily set their ids
  const ts2 = rhoVM.deploy(ts, forXAst, joinId);
  const ts3 = rhoVM.deploy(ts2, sendAst, sendId);

  // Perform the comm event
  const ts4 = rhoVM.executeComm(ts3, joinId, [sendId]);

  // Expect an empty tuplespace when done
  expect(rhoVM.isEmpty(ts4)).toBe(true);
});
