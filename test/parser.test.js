const {Streams} = require('@masala/parser');
const {nilParser, procParser, sendParser} = require('../index');

// Tests for nil parser
test('Parses solo Nil', () => {
  const expected = {
    tag: "Ground",
    value: "Nil",
  }
  const actual = nilParser().parse(Streams.ofString("Nil"));

  expect(actual.value).toEqual(expected);
});

// Tests for send parser
// TODO make this pass https://github.com/d-plaindoux/masala-parser
test('Basic Nil Send', () => {
  const expected = {
    tag: "send",
    chan: {
      tag: "Ground",
      value: "Nil",
    },
    msg: {
      tag: "Ground",
      value: "Nil",
    },
  };
  const actual = sendParser().parse(Streams.ofString("@Nil!(Nil)"));
  expect(actual.value).toEqual(expected);
});
