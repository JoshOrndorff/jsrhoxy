// Basic trees to use repeatedly
const nilAst = {
  tag: "ground",
  type: 'nil',
  value: "Nil",
};

const intAst = {
  tag: "ground",
  type: 'int',
  value: 1,
};

const sendAst = {
  tag: "send",
  chan: nilAst,
  message: nilAst,
};

const send2Ast = {
  tag: "send",
  chan: intAst,
  message: nilAst,
};

const forXAst = {
  tag: "join",
  actions: [
    {
      tag: "action",
      pattern: {
        tag: "variableP",
        givenName: "x"
      },
      chan: nilAst
    }
  ],
  body: nilAst,
};

const forXyAst = {
  tag: "join",
  actions: [
    {
      tag: "action",
      pattern: {
        tag: "variableP",
        givenName: "x"
      },
      chan: nilAst
    },
    {
      tag: "action",
      pattern: {
        tag: "variableP",
        givenName: "y"
      },
      chan: intAst
    }
  ],
  body: nilAst,
};

// new x in { x }
const newXInXAst = {
  tag: "new",
  vars: [
    {
      tag: "variable",
      givenName: "x"
    }
  ],
  body: {
    tag: "variable",
    givenName: "x"
  }
};

module.exports.nilAst = nilAst;
module.exports.intAst = intAst;
module.exports.sendAst = sendAst;
module.exports.send2Ast = send2Ast;
module.exports.forXAst = forXAst;
module.exports.forXyAst = forXyAst;
module.exports.newXInXAst = newXInXAst;
