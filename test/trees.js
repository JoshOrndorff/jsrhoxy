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

module.exports.nilAst = nilAst;
module.exports.intAst = intAst;
module.exports.sendAst = sendAst;
module.exports.send2Ast = send2Ast;
