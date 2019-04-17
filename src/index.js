const nearley = require("nearley");
const grammar = require("./parser/rhoxyGrammar.js");
const rhoVM = require('./rhoVM.js');
const { findCommsFor } = require('./helpers.js');
const { readFileSync } = require('fs');

// Create a Parser object from our grammar
const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

// Open file from the args
const filename = process.argv[2];
const code = readFileSync(filename, 'utf8');

// Parse the source file
const term = parser.feed(code).results[0];

// Create a new tuplespace and deploy the code supplied
const vm = rhoVM();
vm.deploy(term, 1);

//Start the reduction loop
let quiescent = false;
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


// Idea for main program / library
/*
A rest service where the queries are:
* par in a new term
* request the full tuplespace (future enhancement: request only part)
* make a specific reduction
* auto-reduce (future enhancement: auto-reduce until break point)
*/


// Idea for interface
/*
Browser-based repl-debugger-combo where you can par in new terms,
step through reductions interactively (future enhancement: undo a reduction),
and explore the tuplespace interactively.
*/
