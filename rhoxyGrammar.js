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
    {"name": "main", "symbols": ["actions"]},
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
    {"name": "proc", "symbols": ["proc$string$2", "_", {"literal":"("}, "_", "actions", "_", {"literal":")"}, "_", {"literal":"{"}, "_", "proc", "_", {"literal":"}"}], "postprocess":  ([,,,,actions,,,,,,body,,]) => ({
          tag: 'join',
          actions,
          body
        }) },
    {"name": "proc", "symbols": ["proc", "_", {"literal":"|"}, "_", "proc"], "postprocess":  ([p1,,,,p2]) => {
          ps1 = p1.tag === "par" ? p1.procs : [p1]
          ps2 = p2.tag === "par" ? p2.procs : [p2]
          return {
            tag: "par",
            procs: ps1.concat(ps2)
          }
        } },
    {"name": "chan", "symbols": [{"literal":"@"}, "proc"], "postprocess": ([,c]) => c},
    {"name": "actions", "symbols": ["action"]},
    {"name": "actions", "symbols": ["actions", "_", {"literal":";"}, "_", "action"], "postprocess":  ([actions,,,,action]) =>
        actions.concat([action])
               },
    {"name": "action$string$1", "symbols": [{"literal":"<"}, {"literal":"-"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "action", "symbols": ["_", "pattern", "_", "action$string$1", "_", "chan", "_"], "postprocess":  ([,pattern,,,,chan,]) => ({
          tag: "action",
          pattern,
          chan
        }) },
    {"name": "pattern", "symbols": ["variable"], "postprocess": id},
    {"name": "variable$ebnf$1", "symbols": []},
    {"name": "variable$ebnf$1", "symbols": ["variable$ebnf$1", /[a-zA-Z0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "variable", "symbols": [/[a-zA-Z]/, "variable$ebnf$1"], "postprocess":  ([n, ame]) => ({
          tag: "variable",
          givenName: n + ame.join('')
        }) }
]
  , ParserStart: "main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
