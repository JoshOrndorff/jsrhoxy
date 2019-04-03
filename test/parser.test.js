const nearley = require("nearley");
const grammar = require("../rhoxyGrammar.js");
const { nilAst, sendAst } = require('./trees.js');

let parser;
beforeEach(() => {
  parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
});

// Tests for nil parser
test('Simple Nil', () => {
  parser.feed("Nil");

  expect(parser.results[0]).toEqual(nilAst);
});

test('Nil w/ whitespace', () => {
  parser.feed("    Nil \t ");

  expect(parser.results[0]).toEqual(nilAst);
});

// Tests for int parser
test('Simple int', () => {
  parser.feed("23");

  const expected = {
    tag: "ground",
    type: "int",
    value: 23
  }

  expect(parser.results[0]).toEqual(expected);
});

test('Positive int', () => {
  parser.feed("+4132");

  const expected = {
    tag: "ground",
    type: "int",
    value: 4132
  }

  expect(parser.results[0]).toEqual(expected);
});

test('Negative int', () => {
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
  parser.feed(" true\n");

  const expected = {
    tag: "ground",
    type: "bool",
    value: true
  }

  expect(parser.results[0]).toEqual(expected);
});

test('false', () => {
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
  parser.feed("@Nil!(Nil)");

  expect(parser.results[0]).toEqual(sendAst);
});

test('Send w/ grounds', () => {
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
  parser.feed("bundle{Nil}");

  const expected = {
    tag: "bundle",
    proc: nilAst
  };

  expect(parser.results[0]).toEqual(expected);
});

test('Bundle w/ space', () => {
  parser.feed("bundle {Nil}");

  const expected = {
    tag: "bundle",
    proc: nilAst
  };

  expect(parser.results[0]).toEqual(expected);
});

// Tests for comments
test('Comment 1', () => {
  parser.feed("/* comment */ Nil");

  expect(parser.results[0]).toEqual(nilAst);
});


test('Comment 2', () => {
  // Warning this one fails without the final new line.
  // Could "fix" that by always tacking on a new line before
  // passing the code to the parser.
  // That would make requiring the \n acceptible expected parser behavior.
  parser.feed("Nil // comment\n");

  expect(parser.results[0]).toEqual(nilAst);
});

test('Comment 3', () => {
  parser.feed("@Nil/**/!(/**/Nil)//dasfasdf\n/**/");

  expect(parser.results[0]).toEqual(sendAst);
});
