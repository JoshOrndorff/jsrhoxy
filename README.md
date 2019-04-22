jsRhoxy
=====

Rhoxy is a family of interpreters for the [rholang](https://rholang.org/wiki) programming language (specifically its simplified syntax). This is the javascript implementation.

This project strives to be a complete but minimal implementation of rholang as well as a learning and exploration tool.

Right now not much is working, but there is a parser, a tuplespace, and basic comm support. The colab did a code walkthrough on 05 April 2019. [Part 1](https://youtu.be/Id0kujWyNf4) is on youtube, but Part 2 was lost.

Usage
-----
* Clone this repo `git clone https://github.com/JoshOrndorff/jsrhoxy`
* Install dependencies `npm install`
* (Optional) Run the tests `npm run test`
* Write rholang code ``new stdout(`rho:io:stdout`) in {stdout!("Hello World")}``
* aspirational: run the code you just wrote



Terms and ASTs
--------------
TODO document these

Sources are the nearly grammar in `src/parser/rhoxy.ne` and the test trees in `test/trees.js`.

Could also include the ASTs for patterns. Examples are in comment in `src/patternMatcher.js`. Or better yet, make them the same ASTs as much as possible.
