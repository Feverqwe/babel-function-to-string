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
  it('CommentLine', function () {
    assert.equal(run(`const r = function () {//@babelFunctionToString\n}`), `const r = "function(){}";`);
  });
  it('CommentBlock', function () {
    assert.equal(run(`const r = function () {/*@babelFunctionToString*/}`), `const r = "function(){}";`);
  });
  it('leadingCommentLine', function () {
    assert.equal(run(`const r = function () {\n//@babelFunctionToString\nreturn 1}`), `const r = "function(){return 1}";`);
  });
  it('leadingCommentBlock', function () {
    assert.equal(run(`const r = function () {\n/*@babelFunctionToString*/\nreturn 1}`), `const r = "function(){return 1}";`);
  });
});