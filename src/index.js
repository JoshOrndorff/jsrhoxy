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

// Grab a receive (for now just hope it's the one we want)
const join = vm.getArbitraryJoin();

// Find a valid comm
const allSends = findCommsFor(join, vm.sendsByChan());
const chosenSends = allSends[0];

// Perform the requested comm
vm.executeComm(join, chosenSends)





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
