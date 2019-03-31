const nearley = require("nearley");
const grammar = require("../rhoxyGrammar.js");
const { nilAst, sendAst } = require('./trees.js');

// TODO setup method? I would rather construct the parser object
// there than in each test.

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

// Tests for int parser
test('Simple int', () => {
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  parser.feed("23");

  const expected = {
    tag: "ground",
    type: "int",
    value: 23
  }

  expect(parser.results[0]).toEqual(expected);
});

test('Positive int', () => {
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  parser.feed("+4132");

  const expected = {
    tag: "ground",
    type: "int",
    value: 4132
  }

  expect(parser.results[0]).toEqual(expected);
});

test('Negative int', () => {
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  parser.feed("-32");

  const expected = {
    tag: "ground",
    type: "int",
    value: -32
  }

  expect(parser.results[0]).toEqual(expected);
});

// Tests for bool parser
test('true', () => {
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  parser.feed(" true\n");

  const expected = {
    tag: "ground",
    type: "bool",
    value: true
  }

  expect(parser.results[0]).toEqual(expected);
});

test('false', () => {
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  parser.feed("\tfalse");

  const expected = {
    tag: "ground",
    type: "bool",
    value: false
  }

  expect(parser.results[0]).toEqual(expected);
});

// Tests for send parser
test('Basic Send', () => {
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  parser.feed("@Nil!(Nil)");

  expect(parser.results[0]).toEqual(sendAst);
});

test('Send w/ grounds', () => {
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  parser.feed("@4 ! (false)");

  const expected = {
    tag: "send",
    chan: {
      tag: "ground",
      type: "int",
      value: 4
    },
    message: {
      tag: "ground",
      type: "bool",
      value: false
    }
  };

  expect(parser.results[0]).toEqual(expected);
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

// Tests for bundle parser
test('Basic Bundle', () => {
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  parser.feed("bundle{Nil}");

  const expected = {
    tag: "bundle",
    proc: nilAst
  };

  expect(parser.results[0]).toEqual(expected);
});

// Tests for bundle parser
test('Bundle w/ space', () => {
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  parser.feed("bundle {Nil}");

  const expected = {
    tag: "bundle",
    proc: nilAst
  };

  expect(parser.results[0]).toEqual(expected);
});
