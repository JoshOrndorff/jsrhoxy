@builtin "whitespace.ne"
@include "ground.ne"

# Apparently, the top-level thing should always be the first parse rule
main -> _ proc _ {% ([,p,]) => p %}

proc ->
    ground {% id %}
  | chan _ "!" _ "(" _ proc _ ")"
      {% ([chan,,,,,,message,,]) => ({
        tag: 'send',
        chan,
        message
      }) %}

  | "for" _ "(" _ actions _ ")" _ "{" _ proc _ "}"
      {% ([,,,,actions,,,,,,body,,]) => ({
        tag: 'join',
        actions,
        body
      }) %}
  | proc _ "|" _ proc
      {% ([p1,,,,p2]) => {
        ps1 = p1.tag === "par" ? p1.procs : [p1]
        ps2 = p2.tag === "par" ? p2.procs : [p2]
        return {
          tag: "par",
          procs: ps1.concat(ps2)
        }
      } %}
  | "bundle" _ "{" proc "}"
      # For now bundles are only to prevent destructuring. Not read-write restriction.
      {% ([,,,proc,]) => ({
        tag: "bundle",
        proc
      }) %}

chan -> "@" proc {% ([,c]) => c %}


actions ->
    action # Don't manually put this in a list {% d => [d] %}
           # Parsers always return a one-deeper list
  # TODO multiple actions doesn't seem to work yet. Ambiguous grammar.
  # nearley-test rhoxyGrammar.js --input "x <- @Nil; y <- @Nil"
  | actions _ ";" _ action
      {% ([actions,,,,action]) =>
        actions.concat([action])
       %}


action -> _ pattern _ "<-" _ chan _
  {% ([,pattern,,,,chan,]) => ({
    tag: "action",
    pattern,
    chan
  }) %}

# TODO right now the only kind of pattern is a simple variable
pattern -> variable {% id %}

variable ->
  [a-zA-Z] [a-zA-Z0-9]:*
    {% ([n, ame]) => ({
      tag: "variable",
      givenName: n + ame.join('')
    }) %}
