const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: {
    content: './src/content/content.ts',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.json',
            },
          },
        ],
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
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
}
