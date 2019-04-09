const { Map } = require('immutable');

/**
 * Determines whether a process matches a pattern and if so,
 * returns the generated bindings. Assumes that the process passed
 * in is a valid and fully-concrete AST.
 *
 * @param pattern The pattern that may or may not be matched
 * @param process The process that may or may not match
 * @return An immutible Map of bindings, or false
 */
module.exports.patternMatch = patternMatch;
function patternMatch(pattern, process) {

  switch (pattern.tag) {
    case "wildcardP": {
      return new Map();
    }

    case "variableP": {
      return Map([[pattern.givenName, process]]);
    }

    default:{
      throw "Unknown pattern type supplied";
    }
  }
}

//TODO Would it be useful to have a function called
// matches that works basically the same but doesn't
// collect the bindings? Seems like premature optimization atm.

/*
Here are some example of patterns

// A wildcard
{
  tag: "wildcardP",
}

// A nil Pattern
{
  tag: "nilP"
}

// A freevariable
{
  tag: "variableP",
  givenName: "x",
}

// A pair (2-tuple)

// An integer

// A boolean

// A Send

// A Par

// A Receive

None of this makes any attempt to handle primitive-type patterns like
Int, String, ByteArray, etc or the connectives like /\, \/, ~.
*/
