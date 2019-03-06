@builtin "whitespace.ne"


proc ->
    "Nil"
      {% ([_]) => ({
        tag: "ground",
        type: "nil",
        val: "Nil"
      }) %}
  | chan _ "!" _ "(" _ proc _ ")"
      {% ([chan,,,,,,message,,]) => ({
        tag: 'send',
        chan,
        message
      }) %}
  ####### TODO rewrite this in terms of a more general join
  | "for" _ "(" _ "var" _ "<-" _ chan _ ")" _ "{" _ proc _ "}"
      {% ([,,,,givenName,,,,chan,,,,,,body,,]) => ({
        tag: 'join',
        binds: {
          givenName,
          chan
        },
        body
      }) %}

chan -> "@" proc {% ([,c]) => c %}

#actions -> actions ";" action

#action -> _ var _ "<-" _ chan _

#var -> [a-zA-Z][a-zA-Z0-9]:*
