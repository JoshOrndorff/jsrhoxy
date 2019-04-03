# Cribbed from https://github.com/kach/nearley/blob/master/builtin/whitespace.ne

# Whitespace: `_` is optional, `__` is mandatory.
_  -> wschar:* {% function(d) {return null;} %}
__ -> wschar:+ {% function(d) {return null;} %}

wschar -> [ \t\n\v\f]                 {% id %}
        | "/*" (.):* "*/" {% id %} # Maybe this will lead to ambiguities? /* a */ b */
        | "//" [^\n]:* "\n" {% id %}
