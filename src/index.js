const babelGenerator = require('babel-generator').default;

const babelOptions = {
  presets: [
    ['env', {
      targets: {
        browsers: [
          'Chrome >= 40',
          'Safari >= 10',
          'Firefox >= 48'
        ]
      }
    }],
    'minify'
  ]
};

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
  comments = path.innerComments || [];
  result = comments.some(some);
  if (!result) {
    comments = path.body && path.body[0] && path.body[0].leadingComments || [];
    result = comments.some(some);
  }
  return result;
};

const getCode = (babel, options, node) => {
  const { types: t } = babel;
  const code = babelGenerator(node, {minified: true}).code;
  const result = babel.transform(`result=${code}`, Object.assign({}, babelOptions, options));
  const ast = result.ast;
  const expressionStatement = ast.program.body[0];
  if (!t.isExpressionStatement(expressionStatement)) {
    throw new Error('Parse error: ' + result.code);
  }
  const functionExpression = expressionStatement.expression.right;
  if (!t.isFunctionExpression(functionExpression)) {
    throw new Error('Parse error: ' + result.code);
  }
  functionExpression.id = undefined;
  return babelGenerator(functionExpression, {minified: true}).code;
};

module.exports = function (babel) {
  const {types: t} = babel;

  return {
    visitor: {
      FunctionExpression(path, state) {
        let found = false;
        const memberExpression = path.parentPath;
        if (t.isMemberExpression(memberExpression)) {
          const identifier = memberExpression.node.property;
          if (t.isIdentifier(identifier) && identifier.name === 'toString') {
            const callExpression = memberExpression.parentPath;
            if (t.isCallExpression(callExpression) && callExpression.node.arguments.length === 0) {
              found = true;
              callExpression.replaceWith(t.stringLiteral(getCode(babel, state.opts, path.node)));
            }
          }
        }
        if (!found) {
          const blockStatement = path.node.body;
          if (t.isBlockStatement(blockStatement) && hasToStringComment(t, blockStatement)) {
            path.replaceWith(t.stringLiteral(getCode(babel, state.opts, path.node)));
          }
        }
      }
    }
  };
};