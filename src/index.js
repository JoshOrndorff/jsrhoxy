const nearley = require("nearley");
const grammar = require("./parser/rhoxyGrammar.js");
const rhoVM = require('./rhoVM.js');
const { randomBytes } = require('tweetnacl');

// Create a Parser object from our grammar
const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

// Read in and parse the code
const term = parser.feed("Nil").results[0];
console.log(term);

// Create a new tuplespace and deploy the code supplied
const ts = rhoVM.fresh();
const newTs = rhoVM.deploy(ts, term, randomBytes(8)); // No need to hog up entropy while I'm just fuxing around

// Check to make sure it is in correctly
console.log("The final state is");
console.log(newTs);




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
