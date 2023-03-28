import HtmlWebpackPlugin from "html-webpack-plugin";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ENTRY_FILE = "./src/index.js";
const ASSET_PATH = "/";
const OUTPUT_PATH = path.join(__dirname, "/dist");
const TEMPLATE_FILE = "./src/index.html";

export default {
  entry: ENTRY_FILE,

  output: {
    publicPath: ASSET_PATH,
    path: OUTPUT_PATH,
    filename: "bundle.js",
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: TEMPLATE_FILE,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
};
