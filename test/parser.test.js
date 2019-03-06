const nearley = require("nearley");
const grammar = require("../rhoxyGrammar.js");
const nilAst = {
  tag: "ground",
  type: 'nil',
  val: "Nil",
};

// Tests for nil parser
test('Parses solo Nil', () => {
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  parser.feed("Nil");
  expect(parser.results[0]).toEqual(nilAst);
});

// Tests for send parser
test('Basic Nil Send', () => {
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  parser.feed("@Nil!(Nil)");
  const expected = {
    tag: "send",
    chan: nilAst,
    message: nilAst,
  };
  expect(parser.results[0]).toEqual(expected);
});
