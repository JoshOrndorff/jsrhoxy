const rhoVM = require('../src/rhoVM.js');
const { randomBytes } = require('tweetnacl');
//const nearley = require("nearley");
//const grammar = require("../rhoxyGrammar.js");
const { nilAst, intAst, sendAst, send2Ast, forXAst, forXyAst } = require('./trees.js');
const { List } = require('immutable');


// Make a fresh virtual machine for each test
let vm;
beforeEach(() => {
  vm = rhoVM.pure();
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
  vm.deploy(forXAst, List([1, 2]));
  vm.deploy(sendAst, List([2, 3]));

  // Perform the comm event
  vm.executeComm(List([1, 2]), [List([2, 3])]);

  // Expect an empty tuplespace when done
  expect(vm.isEmpty()).toBe(true);
});
