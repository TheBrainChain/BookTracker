import path from 'path'
let __dirname = path.resolve(path.dirname(""));
import WriteFilePlugin from 'write-file-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin'
console.log(__dirname)
const module = {
    mode: 'development',
    entry: './src/index.jsx',
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "index_bundle.js",
        globalObject: `typeof self !== 'undefined' ? self : this`,
        publicPath: '/'
    },
    devtool: 'source-map',
    node: {
        fs: 'empty',
    },
    target: 'web',
    resolve: {
        extensions: ['*', '.js', '.jsx']
    },
    module: {
        rules: [{
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                        plugins: ["@babel/plugin-transform-runtime", '@babel/plugin-transform-async-to-generator']
                    }
                }
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
        ]
    },
    plugins: [
        new WriteFilePlugin(),
        new HtmlWebpackPlugin({
            template: './src/index.html'
        })
    ]
};

export default module;