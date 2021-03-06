const { prettyPrint } = require('./helpers.js');

module.exports = [
  {
    tag: "join*",
    persistence: 999, //Hack; Only 999 stdout prints can happen in vm
    actions: [
      {
        tag: "action",
        pattern: {
          tag: "variableP",
          givenName: "msg",
        },
        chan: 'rho:io:stdout',
      }
    ],
    body: (bindings) => {console.log(prettyPrint(bindings.get("msg")))}
  },
  {
    tag: "join*",
    persistence: 999,
    actions: [
      {
        tag: "action",
        pattern: {
          tag: "variableP",
          givenName: "msg",
        },
        chan: 'rho:io:stderr',
      }
    ],
    body: (bindings) => {console.error(prettyPrint(bindings.get("msg")))}
  }
]
