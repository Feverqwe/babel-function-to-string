const assert = require('assert');
const {transformSync} = require('@babel/core');
const functionToString = require('../src');

const run = code => {
  return transformSync(code, {
    plugins: [
      [functionToString, {
        presets: [
          ['@babel/preset-env', {
            targets: {
              browsers: [
                'Chrome >= 40'
              ]
            }
          }]
        ]
      }]
    ]
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