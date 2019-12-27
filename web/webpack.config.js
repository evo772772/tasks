const path               = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin  = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin  = require('html-webpack-plugin');
const TerserPlugin       = require('terser-webpack-plugin');

const { url, port } = require('./src/config');
const theme = require('./src/styles/theme');

module.exports = (env, argv) => {

	const ENV = process.env.NODE_ENV;

	process.env.BABEL_ENV = ENV;

	let config = {

		mode: ENV,

		entry: './src/index.js',

		output: {
			path: path.resolve(__dirname, 'dist'),
			publicPath: '/',
			filename: 'assets/js/[name].[hash].js'
		},

		module: {
			rules: [
				{
					test: /\.js$/,
					exclude: /node_modules/,
					loader: 'babel-loader'
				},
				{
					test: /\.less$/,
					use: ExtractTextPlugin.extract({
						fallback: 'style-loader',
						use: [
							{
								loader: 'css-loader',
								options: { sourceMap: ENV === 'development' }
							},
							{
								loader: 'less-loader',
								options: { sourceMap: ENV === 'development', javascriptEnabled: true, modifyVars: theme }
							}
						]
					})
				}
			]
		},

		plugins: [
			new CleanWebpackPlugin(['dist']),
			new ExtractTextPlugin('assets/css/[name].[hash].css'),
			new HtmlWebpackPlugin({
				template: path.resolve(__dirname, 'src/index.html'),
				filename: 'index.html',
				minify: ENV === 'production'
			})
		],

		optimization: {
			// runtimeChunk: 'single',
			splitChunks: {
				cacheGroups: {
					vendor: {
						test: /[\\/]node_modules[\\/]/,
						name: 'vendors',
						chunks: 'all'
					}
				}
			}
		},

		devServer: {
			public: url,
			contentBase: path.resolve(__dirname, 'dist'),
			historyApiFallback: true,
			disableHostCheck: true,
			hot: true,
			port: port
		}

	}

	if (ENV === 'development') config.devtool = 'source-map';
	if (ENV === 'production')  config.optimization.minimizer = [
		new TerserPlugin({
			terserOptions: {
				output: { comments: false }
			}
		})
	];

	return config;

}