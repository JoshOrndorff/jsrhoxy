// Generated automatically by nearley, version 2.16.0
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }
var grammar = {
    Lexer: undefined,
    ParserRules: [
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", "wschar"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": function(d) {return null;}},
    {"name": "__$ebnf$1", "symbols": ["wschar"]},
    {"name": "__$ebnf$1", "symbols": ["__$ebnf$1", "wschar"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "__", "symbols": ["__$ebnf$1"], "postprocess": function(d) {return null;}},
    {"name": "wschar", "symbols": [/[ \t\n\v\f]/], "postprocess": id},
    {"name": "proc$string$1", "symbols": [{"literal":"N"}, {"literal":"i"}, {"literal":"l"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "proc", "symbols": ["proc$string$1"], "postprocess":  ([_]) => ({
          tag: "ground",
          type: "nil",
          val: "Nil"
        }) },
    {"name": "proc", "symbols": ["chan", "_", {"literal":"!"}, "_", {"literal":"("}, "_", "proc", "_", {"literal":")"}], "postprocess":  ([chan,,,,,,message,,]) => ({
          tag: 'send',
          chan,
          message
        }) },
    {"name": "proc$string$2", "symbols": [{"literal":"f"}, {"literal":"o"}, {"literal":"r"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "proc$string$3", "symbols": [{"literal":"v"}, {"literal":"a"}, {"literal":"r"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "proc$string$4", "symbols": [{"literal":"<"}, {"literal":"-"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "proc", "symbols": ["proc$string$2", "_", {"literal":"("}, "_", "proc$string$3", "_", "proc$string$4", "_", "chan", "_", {"literal":")"}, "_", {"literal":"{"}, "_", "proc", "_", {"literal":"}"}], "postprocess":  ([,,,,givenName,,,,chan,,,,,,body,,]) => ({
          tag: 'join',
          binds: {
            givenName,
            chan
          },
          body
        }) },
    {"name": "chan", "symbols": [{"literal":"@"}, "proc"], "postprocess": ([,c]) => c}
]
  , ParserStart: "proc"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
