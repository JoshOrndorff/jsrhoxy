// Generated automatically by nearley, version 2.16.0
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

function groundTree(type, value) {
  return {
    tag: "ground",
    type,
    value
  }
}
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
    {"name": "wschar$string$1", "symbols": [{"literal":"/"}, {"literal":"*"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "wschar$ebnf$1", "symbols": []},
    {"name": "wschar$ebnf$1$subexpression$1", "symbols": [/./]},
    {"name": "wschar$ebnf$1", "symbols": ["wschar$ebnf$1", "wschar$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "wschar$string$2", "symbols": [{"literal":"*"}, {"literal":"/"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "wschar", "symbols": ["wschar$string$1", "wschar$ebnf$1", "wschar$string$2"], "postprocess": id},
    {"name": "wschar$string$3", "symbols": [{"literal":"/"}, {"literal":"/"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "wschar$ebnf$2", "symbols": []},
    {"name": "wschar$ebnf$2", "symbols": ["wschar$ebnf$2", /[^\n]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "wschar", "symbols": ["wschar$string$3", "wschar$ebnf$2", {"literal":"\n"}], "postprocess": id},
    {"name": "unsigned_int$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "unsigned_int$ebnf$1", "symbols": ["unsigned_int$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "unsigned_int", "symbols": ["unsigned_int$ebnf$1"], "postprocess": 
        function(d) {
            return parseInt(d[0].join(""));
        }
        },
    {"name": "int$ebnf$1$subexpression$1", "symbols": [{"literal":"-"}]},
    {"name": "int$ebnf$1$subexpression$1", "symbols": [{"literal":"+"}]},
    {"name": "int$ebnf$1", "symbols": ["int$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "int$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "int$ebnf$2", "symbols": [/[0-9]/]},
    {"name": "int$ebnf$2", "symbols": ["int$ebnf$2", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "int", "symbols": ["int$ebnf$1", "int$ebnf$2"], "postprocess": 
        function(d) {
            if (d[0]) {
                return parseInt(d[0][0]+d[1].join(""));
            } else {
                return parseInt(d[1].join(""));
            }
        }
        },
    {"name": "unsigned_decimal$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "unsigned_decimal$ebnf$1", "symbols": ["unsigned_decimal$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "unsigned_decimal$ebnf$2$subexpression$1$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "unsigned_decimal$ebnf$2$subexpression$1$ebnf$1", "symbols": ["unsigned_decimal$ebnf$2$subexpression$1$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "unsigned_decimal$ebnf$2$subexpression$1", "symbols": [{"literal":"."}, "unsigned_decimal$ebnf$2$subexpression$1$ebnf$1"]},
    {"name": "unsigned_decimal$ebnf$2", "symbols": ["unsigned_decimal$ebnf$2$subexpression$1"], "postprocess": id},
    {"name": "unsigned_decimal$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "unsigned_decimal", "symbols": ["unsigned_decimal$ebnf$1", "unsigned_decimal$ebnf$2"], "postprocess": 
        function(d) {
            return parseFloat(
                d[0].join("") +
                (d[1] ? "."+d[1][1].join("") : "")
            );
        }
        },
    {"name": "decimal$ebnf$1", "symbols": [{"literal":"-"}], "postprocess": id},
    {"name": "decimal$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "decimal$ebnf$2", "symbols": [/[0-9]/]},
    {"name": "decimal$ebnf$2", "symbols": ["decimal$ebnf$2", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "decimal$ebnf$3$subexpression$1$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "decimal$ebnf$3$subexpression$1$ebnf$1", "symbols": ["decimal$ebnf$3$subexpression$1$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "decimal$ebnf$3$subexpression$1", "symbols": [{"literal":"."}, "decimal$ebnf$3$subexpression$1$ebnf$1"]},
    {"name": "decimal$ebnf$3", "symbols": ["decimal$ebnf$3$subexpression$1"], "postprocess": id},
    {"name": "decimal$ebnf$3", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "decimal", "symbols": ["decimal$ebnf$1", "decimal$ebnf$2", "decimal$ebnf$3"], "postprocess": 
        function(d) {
            return parseFloat(
                (d[0] || "") +
                d[1].join("") +
                (d[2] ? "."+d[2][1].join("") : "")
            );
        }
        },
    {"name": "percentage", "symbols": ["decimal", {"literal":"%"}], "postprocess": 
        function(d) {
            return d[0]/100;
        }
        },
    {"name": "jsonfloat$ebnf$1", "symbols": [{"literal":"-"}], "postprocess": id},
    {"name": "jsonfloat$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "jsonfloat$ebnf$2", "symbols": [/[0-9]/]},
    {"name": "jsonfloat$ebnf$2", "symbols": ["jsonfloat$ebnf$2", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "jsonfloat$ebnf$3$subexpression$1$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "jsonfloat$ebnf$3$subexpression$1$ebnf$1", "symbols": ["jsonfloat$ebnf$3$subexpression$1$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "jsonfloat$ebnf$3$subexpression$1", "symbols": [{"literal":"."}, "jsonfloat$ebnf$3$subexpression$1$ebnf$1"]},
    {"name": "jsonfloat$ebnf$3", "symbols": ["jsonfloat$ebnf$3$subexpression$1"], "postprocess": id},
    {"name": "jsonfloat$ebnf$3", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "jsonfloat$ebnf$4$subexpression$1$ebnf$1", "symbols": [/[+-]/], "postprocess": id},
    {"name": "jsonfloat$ebnf$4$subexpression$1$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "jsonfloat$ebnf$4$subexpression$1$ebnf$2", "symbols": [/[0-9]/]},
    {"name": "jsonfloat$ebnf$4$subexpression$1$ebnf$2", "symbols": ["jsonfloat$ebnf$4$subexpression$1$ebnf$2", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "jsonfloat$ebnf$4$subexpression$1", "symbols": [/[eE]/, "jsonfloat$ebnf$4$subexpression$1$ebnf$1", "jsonfloat$ebnf$4$subexpression$1$ebnf$2"]},
    {"name": "jsonfloat$ebnf$4", "symbols": ["jsonfloat$ebnf$4$subexpression$1"], "postprocess": id},
    {"name": "jsonfloat$ebnf$4", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "jsonfloat", "symbols": ["jsonfloat$ebnf$1", "jsonfloat$ebnf$2", "jsonfloat$ebnf$3", "jsonfloat$ebnf$4"], "postprocess": 
        function(d) {
            return parseFloat(
                (d[0] || "") +
                d[1].join("") +
                (d[2] ? "."+d[2][1].join("") : "") +
                (d[3] ? "e" + (d[3][1] || "+") + d[3][2].join("") : "")
            );
        }
        },
    {"name": "ground$string$1", "symbols": [{"literal":"N"}, {"literal":"i"}, {"literal":"l"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "ground", "symbols": ["ground$string$1"], "postprocess": d => groundTree("nil"   , "Nil")},
    {"name": "ground", "symbols": ["int"], "postprocess": d => groundTree("int"   , d[0])},
    {"name": "ground", "symbols": ["bool"], "postprocess": d => groundTree("bool"  , d[0])},
    {"name": "ground", "symbols": ["string"], "postprocess": d => groundTree("string", d[0])},
    {"name": "bool$string$1", "symbols": [{"literal":"t"}, {"literal":"r"}, {"literal":"u"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "bool", "symbols": ["bool$string$1"], "postprocess": () => true},
    {"name": "bool$string$2", "symbols": [{"literal":"f"}, {"literal":"a"}, {"literal":"l"}, {"literal":"s"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "bool", "symbols": ["bool$string$2"], "postprocess": () => false},
    {"name": "string$ebnf$1", "symbols": []},
    {"name": "string$ebnf$1", "symbols": ["string$ebnf$1", /./], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "string", "symbols": [{"literal":"\""}, "string$ebnf$1", {"literal":"\""}], "postprocess": ([,s,]) => s.join('')},
    {"name": "pattern$ebnf$1", "symbols": []},
    {"name": "pattern$ebnf$1", "symbols": ["pattern$ebnf$1", /[a-zA-Z0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "pattern", "symbols": [/[a-zA-Z]/, "pattern$ebnf$1"], "postprocess":  ([n, ame]) => ({
          tag: "variableP",
          givenName: n + ame.join('')
        }) },
    {"name": "main", "symbols": ["_", "proc", "_"], "postprocess": ([,p,]) => p},
    {"name": "proc", "symbols": ["ground"], "postprocess": id},
    {"name": "proc", "symbols": [{"literal":"{"}, "_", "proc", "_", {"literal":"}"}], "postprocess": ([,,proc,,]) => (proc)},
    {"name": "proc", "symbols": ["chan", "_", {"literal":"!"}, "_", {"literal":"("}, "_", "proc", "_", {"literal":")"}], "postprocess":  ([chan,,,,,,message,,]) => ({
          tag: 'send',
          chan,
          message
        }) },
    {"name": "proc$string$1", "symbols": [{"literal":"f"}, {"literal":"o"}, {"literal":"r"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "proc", "symbols": ["proc$string$1", "_", {"literal":"("}, "_", "actions", "_", {"literal":")"}, "_", {"literal":"{"}, "_", "proc", "_", {"literal":"}"}], "postprocess":  ([,,,,actions,,,,,,body,,]) => ({
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
    {"name": "proc$string$2", "symbols": [{"literal":"b"}, {"literal":"u"}, {"literal":"n"}, {"literal":"d"}, {"literal":"l"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "proc", "symbols": ["proc$string$2", "_", {"literal":"{"}, "proc", {"literal":"}"}], "postprocess":  ([,,,proc,]) => ({
          tag: "bundle",
          proc
        }) },
    {"name": "proc$string$3", "symbols": [{"literal":"n"}, {"literal":"e"}, {"literal":"w"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "proc$string$4", "symbols": [{"literal":"i"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "proc", "symbols": ["proc$string$3", "__", "variables", "__", "proc$string$4", "_", "proc"], "postprocess":  ([,,vars,,,,body]) => ({
            tag: "new",
            vars,
            body
        }) },
    {"name": "proc$string$5", "symbols": [{"literal":"("}, {"literal":"`"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "proc$string$6", "symbols": [{"literal":"`"}, {"literal":")"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "proc$string$7", "symbols": [{"literal":"i"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "proc", "symbols": ["lookup", "__", "variable", "proc$string$5", "uri", "proc$string$6", "_", "proc$string$7", "_", "proc"], "postprocess":  ([,,v,,uri,,,,,body]) => ({
          tag: "lookup",
          v,
          uri,
          body
        }) },
    {"name": "proc$ebnf$1", "symbols": [{"literal":"*"}]},
    {"name": "proc$ebnf$1", "symbols": ["proc$ebnf$1", {"literal":"*"}], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "proc", "symbols": ["proc$ebnf$1", "variable"], "postprocess": ([,v]) => v},
    {"name": "uri$ebnf$1", "symbols": []},
    {"name": "uri$ebnf$1", "symbols": ["uri$ebnf$1", /[a-zA-Z0-9:]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "uri", "symbols": ["uri$ebnf$1"], "postprocess": ([l]) => l.join('')},
    {"name": "lookup$string$1", "symbols": [{"literal":"n"}, {"literal":"e"}, {"literal":"w"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "lookup", "symbols": ["lookup$string$1"]},
    {"name": "lookup$string$2", "symbols": [{"literal":"l"}, {"literal":"o"}, {"literal":"o"}, {"literal":"k"}, {"literal":"u"}, {"literal":"p"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "lookup", "symbols": ["lookup$string$2"], "postprocess": (d) => null},
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
    {"name": "variable$ebnf$1", "symbols": []},
    {"name": "variable$ebnf$1", "symbols": ["variable$ebnf$1", /[a-zA-Z0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "variable", "symbols": [/[a-zA-Z]/, "variable$ebnf$1"], "postprocess":  ([n, ame]) => ({
          tag: "variable",
          givenName: n + ame.join('')
        }) },
    {"name": "variables", "symbols": ["variable"]},
    {"name": "variables", "symbols": ["variables", "_", {"literal":","}, "_", "variable"], "postprocess":  ([variables,,,,variable]) =>
        variables.concat([variable])
             }
]
  , ParserStart: "main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
