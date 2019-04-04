const { patternMatch } = require("../src/patternMatcher.js");
const { nilAst, intAst } = require('./trees.js');
const { Map } = require('immutable');

const wildP = { tag: "wildcardP" };
const varXP = {
  tag: "variableP",
  givenName: "x",
}


beforeEach(() => {

});

// Test that wildcard matches anything
test('Wild Nil', () => {
  expect(patternMatch(wildP, nilAst)).toEqual(new Map());
});

test('Wild Int', () => {
  expect(patternMatch(wildP, intAst)).toEqual(new Map());
});

// Test that variable matches anything
test('Var Nil', () => {
  expect(patternMatch(varXP, nilAst)).toEqual(Map({x: nilAst}));
});

test('Var Int', () => {
  expect(patternMatch(varXP, intAst)).toEqual(Map({x: intAst}));
});

// Test that IntP only matches integers
