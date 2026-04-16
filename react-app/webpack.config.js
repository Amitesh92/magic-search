const webpack = require('webpack');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, 'src/test-react-app.js'), 
  output: {
    filename: 'test-react-app.js',
    libraryTarget: 'system', 
    path: path.resolve(__dirname, 'dist'),
    publicPath: '', 
  },

  module: {
    rules: [
      {
        // 1. REGULAR APP FILES (React/JSX)
        test: /\.(js|jsx)$/,
        exclude: [/node_modules/, path.resolve(__dirname, '../shared/')], 
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env', 
              ['@babel/preset-react', { "runtime": "classic" }]
            ]
          }
        }
      },
      {
        // 2. SHARED WEB COMPONENT (Plain JS)
        // We handle this separately to avoid Babel "helpers" errors
        test: /shared\/.*\.js$/,
        type: 'javascript/auto', 
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ]
  },
  devServer: {
    port: 8081,
    hot: false,
    headers: { "Access-Control-Allow-Origin": "*" },
    historyApiFallback: true, // Recommended for single-spa
    client: {
      overlay: false, 
    },
  },
  externals: ['react', 'react-dom', 'single-spa'], 
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.ProvidePlugin({ React: 'react' }),
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      '@shared': path.resolve(__dirname, '../shared/'),
    },
  }
};