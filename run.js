const functionToString = require('./src');
const webpack = require('webpack');
const path = require('path');

const config = {
  entry: {
    script: './script'
  },
  output: {
    path: path.resolve('./dist'),
    filename: '[name].js'
  },
  devtool: 'none',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [
              functionToString,
              'transform-runtime'
            ]
          }
        }
      },
    ]
  },
};

const run = () => {
  /*
  const ast = transform(`
  require('test');
  `).ast;
  delete ast.tokens;
  console.log('ast', JSON.stringify(ast));
  */
  return new Promise((resolve, reject) => {
    webpack(config, (err, stats) => {
      if (err) return reject(err);
      console.log((stats.toString(Object.assign(webpack.Stats.presetToOptions('default'), {
        colors: true,
      }))));
      resolve();
    });
  });
};

run();