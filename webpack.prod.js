const config = require('./webpack.config')

module.exports = {
  ...config,
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.prod.json',
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
}
