import webpack from "webpack";
import ExtractTextPlugin from "extract-text-webpack-plugin";
import { PLUGIN_NAME } from "./constants/plugin";
import {
  ROOT,
  SRC,
  DIST,
} from "./constants/paths";

export default {
  context: ROOT,
  devtool: "source-map",
  entry: [
    'babel-polyfill',
    `${SRC}/index.js`,
  ],
  resolve: {
    root: [
      ROOT,
    ],
  },
  output: {
    path: DIST,
    publicPath: DIST,
    filename: `${PLUGIN_NAME}.min.js`,
  },
  plugins: [
    new webpack.NoErrorsPlugin(),
    new ExtractTextPlugin(`${PLUGIN_NAME}.min.css`),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    new webpack.optimize.UglifyJsPlugin({ compress: { warnings: false } }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.optimize.DedupePlugin(),
  ],
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract(
          'style',
          'css!postcss?sourceMap=true'
        ),
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel',
      },
    ],
  },
  postcss: webpack => [
    require("postcss-import")({
      addDependencyTo: webpack,
      skipDuplicates: true,
    }),
    require("postcss-url")(),
    require("postcss-cssnext")(),
    require("postcss-browser-reporter")(),
    require("postcss-reporter")(),
  ],
};