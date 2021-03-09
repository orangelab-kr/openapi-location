/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const slsw = require('serverless-webpack');

module.exports = {
  target: 'node',
  entry: slsw.lib.entries,
  mode: 'none',
  externals: [nodeExternals()],
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [new CopyWebpackPlugin({ patterns: ['./prisma/schema.prisma'] })],
  output: {
    libraryTarget: 'commonjs',
    filename: '[name].js',
    path: path.resolve(__dirname, '.webpack'),
  },
  optimization: {
    concatenateModules: true,
  },
};
