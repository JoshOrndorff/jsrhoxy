
const {C, F} = require('@masala/parser');


// Parser Definitions

function nilParser() {
  return C.string("Nil")
    .thenReturns({
      tag: "Ground",
      value: "Nil",
    });
}


function sendParser() {
  return C.char('@')
    .thenRight(procParser())
    .thenLeft(C.char('!'))
    .thenLeft(C.char('('))
    .then(procParser())
    .thenLeft(C.char(')'))
    .map(values => ({
      tag: "send",
      chan: values[0],
      msg: values[1],
    }));
}

function procParser() {
  return F.try(/*receiveParsersendParser)
    .or(*/nilParser())
    .or(sendParser())
    //TODO try other constructors
}


function progParser() {
  procParser()
  .thenLeft(F.eos())
}


module.exports.nilParser = nilParser;
module.exports.sendParser = sendParser;
module.exports.procParser = procParser;
