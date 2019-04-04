const rhoVM = require('../src/rhoVM.js');
const { randomBytes } = require('tweetnacl');
//const nearley = require("nearley");
//const grammar = require("../rhoxyGrammar.js");
const { nilAst, intAst, sendAst, send2Ast, forXAst, forXyAst } = require('./trees.js');
const { List } = require('immutable');


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

  // Deploy the pieces seperately to easily set their ids
  const ts2 = rhoVM.deploy(ts, forXAst, List([1]));
  const ts3 = rhoVM.deploy(ts2, sendAst, List([2]));

  // Perform the comm event
  const ts4 = rhoVM.executeComm(ts3, List([1]), [List([2])]);

  // Expect an empty tuplespace when done
  expect(rhoVM.isEmpty(ts4)).toBe(true);
});
