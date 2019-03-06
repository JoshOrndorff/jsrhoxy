const nearley = require("nearley");
const grammar = require("./rhoxyGrammar.js");

// Create a Parser object from our grammar.
const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));


// parser.results is an array of possible parsings.
parser.feed("for(var <- @Nil){Nil}");
//parser.feed("@Nil!(Nil)");
//parser.feed("Nil");
console.log(parser.results);
