const loaderUtils = require("loader-utils");
const webpack = require('webpack');
const path = require('path');
const fs = require('fs-extra');
const crypto = require('crypto');

module.exports = function () {
  const callback = this.async();
  const loaderOptions = loaderUtils.getOptions(this) || {};
  const output = path.resolve('./tmp');
  const code = `result = ${loaderOptions.content}`;
  const hash = crypto.createHmac('sha1', code).digest('hex');
  const name = `${hash}.js`;
  const outputName = `${hash}.bundle.js`;
  const filename = path.join(output, name);
  const outputFilename = path.join(output, outputName);

  return fs.access(outputFilename).catch(() => {
    return fs.ensureDir(output).then(() => {
      return fs.writeFile(filename, code);
    }).then(() => {
      const config = {
        entry: filename,
        devtool: 'none',
        mode: 'production',
        output: {
          path: output,
          filename: outputName
        },
        module: {
          rules: [
            {
              test: /\.js$/,
              exclude: /node_modules/,
              use: {
                loader: 'babel-loader',
                options: {

                }
              }
            },
          ]
        }
      };
      return new Promise((resolve, reject) => {
        webpack(config, (err, stats) => {
          if (err) return reject(err);
          console.log((stats.toString(Object.assign(webpack.Stats.presetToOptions('default'), {
            colors: true,
          }))));
          resolve();
        });
      })
    });
  }).then(() => {
    return fs.readFile(outputFilename).then(buffer => {
      return `(function(){var result;${String(buffer)}return result;})()`;
    });
  }).then(code => {
    callback(null, `module.exports = ${JSON.stringify(code)}`);
  }, err => {
    callback(err);
  });
};