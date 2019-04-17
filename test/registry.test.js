const rhoVM = require('../src/rhoVM.js');
const { evaluateInEnvironment } = require('../src/helpers.js');

// Create a VM with the normal registry stuff in it.
let vm;
beforeEach(() => {
  vm = rhoVM();
});

test('stdout is correctly registered', () => {
  // Make sure there is something listening on the correct unforgeable name

  const chanTree = {
    tag: 'ground',
    type: 'unforgeable',
    value: 0, // This is hardcoded for stdout.
  }
  const concreteChan = evaluateInEnvironment(chanTree, {});
  expect(vm.joinsByChan().get(concreteChan).size).toBe(1);
})
