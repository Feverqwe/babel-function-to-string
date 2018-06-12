const babelGenerator = require('babel-generator').default;
const path = require('path');
const qs = require('querystring');

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

const replace = (node, replaceTo, babel) => {
  const {types: t} = babel;
  node.replaceWith(t.expressionStatement(t.callExpression(t.identifier('require'), [
    t.stringLiteral(`${path.resolve('./string-script-loader')}?` + qs.stringify({
      content: babelGenerator(replaceTo).code
    }) + '!')
  ])));
};

module.exports = function (babel) {
  const {types: t} = babel;

  return {
    visitor: {
      CallExpression(path, state) {
        if (t.isMemberExpression(path.node.callee) && path.node.arguments.length === 0) {
          const memberExpression = path.node.callee;
          if (t.isFunctionExpression(memberExpression.object) && t.isIdentifier(memberExpression.property) && memberExpression.property.name === 'toString') {
            replace(path, memberExpression.object, babel);
          }
        }
      },
      BlockStatement(path, state) {
        if (t.isFunctionExpression(path.parent) && hasToStringComment(t, path)) {
          const functionExpression = path.parentPath;
          replace(functionExpression, functionExpression.node, babel);
        }
      }
    }
  };
};