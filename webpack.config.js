const path = require('path');
const webpack = require('webpack');

const isDev = process.env.NODE_ENV !== 'production';

const plugins = isDev
  ? [
      new webpack.NamedModulesPlugin(),
      new webpack.optimize.ModuleConcatenationPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.DefinePlugin({
        'process.env': {
          BUILD_TARGET: JSON.stringify('app'),
          PORT: JSON.stringify(process.env.PORT)
        }
      })
    ]
  : [
      new webpack.NamedModulesPlugin(),
      new webpack.optimize.ModuleConcatenationPlugin(),
      new webpack.DefinePlugin({
        'process.env': {
          BUILD_TARGET: JSON.stringify('production')
        }
      })
    ];

module.exports = {
  entry: './src/index.js',
  watch: isDev,
  target: 'node',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: 'babel-loader',
        include: [
          path.join(__dirname, 'server'),
          path.join(__dirname, 'src'),
          path.join(__dirname, 'config.js')
        ]
      }
    ]
  },
  plugins,
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'app.js'
  }
};
