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
const sendAst = {
  tag: "send",
  chan: nilAst,
  message: nilAst,
};

// Tests for nil parser
test('Simple Nil', () => {
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  parser.feed("Nil");

  expect(parser.results[0]).toEqual(nilAst);
});

test('Nil w/ whitespace', () => {
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  parser.feed("    Nil \t ");

  expect(parser.results[0]).toEqual(nilAst);
});

// Tests for send parser
test('Basic Send', () => {
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  parser.feed("@Nil!(Nil)");

  expect(parser.results[0]).toEqual(sendAst);
});

// Tests for join parser
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

test('two-action join', () => {
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  parser.feed("for(x <- @Nil ; y <- @Nil){Nil}");

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
      },
      {
        tag: "action",
        pattern: {
          tag: "variable",
          givenName: "y"
        },
        chan: nilAst
      }
    ],
    body: nilAst,
  };

  expect(parser.results[0]).toEqual(expected);
});

// Tests for par parser
test('Basic Par', () => {
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  parser.feed("Nil|Nil");

  const expected = {
    tag: "par",
    procs: [
      nilAst,
      nilAst
    ]
  };

  expect(parser.results[0]).toEqual(expected);
});

test('Send | Nil', () => {
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  parser.feed("@Nil!(Nil)|Nil");

  const expected = {
    tag: "par",
    procs: [
      sendAst,
      nilAst
    ]
  };

  expect(parser.results[0]).toEqual(expected);
});

test('Three-Nil Par', () => {
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  parser.feed("Nil|Nil|Nil");

  const expected = {
    tag: "par",
    procs: [
      nilAst,
      nilAst,
      nilAst
    ]
  };

  expect(parser.results[0]).toEqual(expected);
});

test('Par w/ whitespace', () => {
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  parser.feed("Nil |\nNil |\nNil");

  const expected = {
    tag: "par",
    procs: [
      nilAst,
      nilAst,
      nilAst
    ]
  };

  expect(parser.results[0]).toEqual(expected);
});
