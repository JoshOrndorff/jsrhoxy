
pattern ->  [a-zA-Z] [a-zA-Z0-9]:*
    {% ([n, ame]) => ({
      tag: "variableP",
      givenName: n + ame.join('')
    }) %}
