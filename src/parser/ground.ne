@builtin "number.ne"

@{%
function groundTree(type, value) {
  return {
    tag: "ground",
    type,
    value
  }
}
%}

ground ->
    "Nil" {% d => groundTree("nil"   , "Nil") %}
  | int   {% d => groundTree("int"   , d[0])  %}
  | bool  {% d => groundTree("bool"  , d[0])  %}
  | string{% d => groundTree("string", d[0])  %}

bool ->
    "true"  {% () => true %}
  | "false" {% () => false %}

string ->
    "\"" .:* "\"" {% ([,s,]) => s.join('') %}
