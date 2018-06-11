const assert = require('assert');
const {transform} = require('babel-core');
const functionToString = require('../src');

const run = code => {
  return transform(code, {
    plugins: [functionToString]
  }).code.trim();
};

describe('toString', function() {
  it('FunctionExpression', function () {
    assert.equal(run(`const r = function () {}.toString()`), `const r = "function(){}";`);
  });
});