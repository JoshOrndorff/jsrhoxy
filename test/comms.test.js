const rhoVM = require('../src/rhoVM.js');
const { randomBytes } = require('tweetnacl');
//const nearley = require("nearley");
//const grammar = require("../rhoxyGrammar.js");
const { nilAst, intAst, sendAst, send2Ast, forXAst, forXyAst } = require('./trees.js');
const { List } = require('immutable');


// Make a fresh virtual machine for each test
let vm;
beforeEach(() => {
  pureVM = rhoVM.pure();
  vm = rhoVM();
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
  pureVM.deploy(forXAst, List([1, 2]));
  pureVM.deploy(sendAst, List([2, 3]));

  // Perform the comm event
  pureVM.executeComm(List([1, 2]), [List([2, 3])]);

  // Expect an empty tuplespace when done
  expect(pureVM.isEmpty()).toBe(true);
});


test('Hello World', () => {
  //Construct a send on the stdout channel
  //TODO Look up the channel in the registry
  const sendTree = {
    tag: 'send',
    chan: {
      tag: "ground",
      type: "unforgeable",
      value: 0, // This channel hardwired to stdout
    },
    message: {
      tag: "ground",
      type: "string",
      value: "Hello World"
    }
  }

  // Deploy the send
  vm.deploy(sendTree, 12);

  // Perform the comm event
  vm.executeComm(0, [12]);

  // Expect an "empty" tuplespace when done
  // Standard tuplespace has 2 persistent items
  expect(vm.tuplespaceById().count()).toBe(2);
});
