const nearley = require("nearley");
const grammar = require("../rhoxyGrammar.js");

// TODO setup method? I would rather construct the parser object
// there than in each test.

// Basic trees to use repeatedly
const nilAst = {
  tag: "ground",
  type: 'nil',
  val: "Nil",
};

// Tests for nil parser
test('Simple Nil', () => {
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  parser.feed("Nil");

  expect(parser.results[0]).toEqual(nilAst);
});

// Tests for send parser
test('Basic Send', () => {
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  parser.feed("@Nil!(Nil)");

  const expected = {
    tag: "send",
    chan: nilAst,
    message: nilAst,
  };

  expect(parser.results[0]).toEqual(expected);
});

// Tests for receive parser
test('Basic Receive', () => {
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  parser.feed("for(x <- @Nil){Nil}");

  const expected = {
    tag: "join",
    actions: [
      {
        tag: "action",
        pattern: {
          tag: "variable",
          givenName: "x"
        },
        chan: nilAst
      }
    ],
    body: nilAst,
  };

  expect(parser.results[0]).toEqual(expected);
});
