jsRhoxy
=====

Rhoxy is a family of interpreters for the [rholang](https://rholang.org/wiki) programming language (specifically it's simplified syntax). This is the javascript implementation.

This project strives to be a complete but minimal implementation of rholang as well as a learning and exploration tool.

Right now not much is working, but there is a parser, a tuplespace, and basic comm support. The colab did a code walkthrough on 05 Feb 2019. [Part 1](https://youtu.be/Id0kujWyNf4) is on youtube, but Part 2 was lost.

Usage
-----
Clone this repo
run the tests
Write rholang
aspirational: run the code you just wrote.

Virtual Machine Architecture
-------------
It's likely that the entire tuplespace will be converted to use immutable data structures, but right not the top level entity is a regular javascript object.
It's also possible that the tuplespace may be re-written in object-oriented typescript.
Finally, the tuplespace may be modified to cache available comms, but right now there is no caching.
```
// The numbers are a unique id / poor-mans-pseudo-random-state
// associated with each send or receive.  They are immutable Lists containing values that fit into Uint8Array items.
{
  // A Map from id's to process ASTs
  procs: Map {
    123: {tag: "send", ...},
    234: {tag: "send", ...},
    345: {tag: "send", ...},
    567: {tag: "join", ...}
  },
  // A channel-indexed list of all sends
  sends: Map {
    chan1: Set [
      123
    ],
    chan2: Set [
      234,
      345
  ],
  // Channel-indexed list of all joins. There will be dupes, because
  // multi-action joins appear in multiple lists.
  joins: Map {
    chan1: Set[
      567
    ],
    chan2: Set[
      567
    ]
  }
}
```

Terms and ASTs
--------------
TODO document these

Sources are the nearly grammar in `src/parser/rhoxy.ne` and the test trees in `test/trees.js`.

Could also include the ASTs for patterns. Examples are in comment in `src/patternMatcher.js`. Or better yet, make them the same ASTs as much as possible.
