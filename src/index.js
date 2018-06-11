const babelGenerator = require('babel-generator').default;

module.exports = function (babel) {
  const { types: t } = babel;

  return {
    visitor: {
      CallExpression(path) {
        if (t.isMemberExpression(path.node.callee) && path.node.arguments.length === 0) {
          const memberExpression = path.node.callee;
          if (t.isFunctionExpression(memberExpression.object) && t.isIdentifier(memberExpression.property) && memberExpression.property.name === 'toString') {
            path.replaceWith(t.stringLiteral(babelGenerator(memberExpression.object, {minified: true}).code));
          }
        }
      }
    }
  };
};