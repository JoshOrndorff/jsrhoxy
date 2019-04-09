const { sendAst } = require('./trees.js');
const { evaluateInEnvironment } = require('../src/helpers.js');

test('evaluating does not mutate sends', () => {
  const shallowCopy = {...sendAst};

  const evaluated = evaluateInEnvironment(sendAst, {});

  const relevantProperties = ["tag", "chan", "message"];

  // Ensure all the properties we care about are still the same references.
  for (let prop of relevantProperties) {
    expect(sendAst[prop]).toEqual(shallowCopy[prop]);
  }
});

// evaluate in environment doesn't mutate joins

// Same integers are structEquiv
// Different integers are not struct equiv
