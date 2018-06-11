const babelGenerator = require('babel-generator').default;

const hasToStringComment = (t, path) => {
  let result = null;
  let comments = null;
  const some = (node, index) => {
    const result = ['CommentBlock', 'CommentLine'].indexOf(node.type) !== -1 && /@babelFunctionToString/.test(node.value);
    if (result) {
      comments.splice(index, 1);
    }
    return result;
  };
  comments = path.node && path.node.innerComments || [];
  result = comments.some(some);
  if (!result) {
    comments = path.node && path.node.body && path.node.body[0] && path.node.body[0].leadingComments || [];
    result = comments.some(some);
  }
  return result;
};

const getCode = (babel, options, node) => {
  const { types: t } = babel;
  const code = babelGenerator(node, {minified: true}).code;
  const ast = babel.transform(`r=${code}`, Object.assign({}, options)).ast;
  const transformedFunction = ast.program.body[0].expression.right;
  transformedFunction.id = undefined;
  let resultCode = babelGenerator(transformedFunction, {minified: true}).code;
  if (/^"use strict";/.test(resultCode)) {
    resultCode = resultCode.replace('"use strict";', '');
  }
  const m = /^function/.exec(resultCode);
  if (!m) {
    throw new Error('Script was wrapped');
  }
  return resultCode;
};

module.exports = function (babel) {
  const {types: t} = babel;

  return {
    visitor: {
      CallExpression(path, state) {
        if (t.isMemberExpression(path.node.callee) && path.node.arguments.length === 0) {
          const memberExpression = path.node.callee;
          if (t.isFunctionExpression(memberExpression.object) && t.isIdentifier(memberExpression.property) && memberExpression.property.name === 'toString') {
            path.replaceWith(t.stringLiteral(getCode(babel, state.opts, memberExpression.object)));
          }
        }
      },
      BlockStatement(path, state) {
        if (t.isFunctionExpression(path.parent) && hasToStringComment(t, path)) {
          const functionExpression = path.parentPath;
          functionExpression.replaceWith(t.stringLiteral(getCode(babel, state.opts, functionExpression.node)));
        }
      }
    }
  };
};