const path = require("path");
const { VueLoaderPlugin } = require("vue-loader");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  mode: "development",
  entry: path.resolve(__dirname, "src/main.js"),
  output: {
    filename: "test-vue-app.js",
    libraryTarget: "system",
    path: path.resolve(__dirname, "dist"),
    publicPath: "",
  },

  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: "vue-loader",
      },
      {
        // 1. REGULAR VUE JS FILES
        test: /\.js$/,
        // Add the shared path to the exclude list alongside node_modules
        exclude: [/node_modules/, path.resolve(__dirname, '../shared/')],
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        // 2. SHARED WEB COMPONENT
        // Treat it as raw JS so Babel doesn't look for core-js polyfills
        test: /shared\/.*\.js$/,
        type: 'javascript/auto',
      },
      {
        test: /\.css$/i,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
              modules: false,
            },
          },
        ],
      },
    ],
  },
  devServer: {
    port: 8082,
    hot: false,
    headers: { "Access-Control-Allow-Origin": "*" },
    client: { overlay: false },
  },
  externals: ["vue", "single-spa"],
  plugins: [new CleanWebpackPlugin(), new VueLoaderPlugin()],
  resolve: {
    extensions: [".js", ".vue"],
    alias: {
      '@shared': path.resolve(__dirname, '../shared/'),
    },
  },
};