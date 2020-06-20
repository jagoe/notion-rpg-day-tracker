const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const mode = process.env.NODE_ENV
const devMode = mode === 'development'

module.exports = {
  entry: './src/content.ts',
  mode,
  devtool: devMode ? 'inline-source-map' : '',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {from: 'styles', to: 'styles'},
        {from: 'images', to: 'images'},
        {from: 'manifest.json', to: 'manifest.json'},
      ],
    }),
  ],
  resolve: {
    extensions: ['.ts'],
  },
  output: {
    filename: 'content.js',
    path: path.resolve(__dirname, 'dist'),
  },
}
