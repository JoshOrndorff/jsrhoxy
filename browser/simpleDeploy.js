const nearley = require("nearley");
const grammar = require("../src/parser/rhoxyGrammar.js");
const rhoVM = require('../src/rhoVM.js');
const { findCommsFor } = require('../src/helpers.js');

// Create a Parser object from our grammar
const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

//TODO read in code from browser interface
const code = `
lookup stdout(\`rho:io:stdout\`) in {
  @*stdout!("Hello World") |
  @*stdout!("Dude")
}
`

// Parse the source
const term = parser.feed(code).results[0];

// Create a new tuplespace and deploy the code supplied
console.log("0 about to deploy")
const vm = rhoVM();
vm.deploy(term, 1);

//Start the reduction loop
let quiescent = false;
console.log("4 about to start reducing")
while (!quiescent) {
  // Grab all the joins in the tuplespace
  const allJoins = vm.allJoins();

  quiescent = true;
  for (let join of allJoins) {

    // Look for a valid comm
    const allSends = findCommsFor(join, vm.sendsByChan());

    // If we found a valid comm, perform it
    if (allSends.length > 0) {
      const chosenSends = allSends[0];
      vm.executeComm(join, chosenSends);
      quiescent = false;
      break;
    }
  }
}
