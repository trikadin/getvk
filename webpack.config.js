const
	query = require('querystring'),
	path = require('path'),

	config = require('config'),
	$C = require('collection.js').$C,
	autoprefixer = require('autoprefixer');

const
	output = path.resolve(config.buildDir),
	filename = '[name]';

module.exports = {
	entry: $C({
		background: 'background.js',
		content: 'content.js'
	}).map((e) => './src/' + e),

	output: {
		path: output,
		filename: filename + '.js'
	},

	module: {
		loaders: [
			{
				test: /\.js$/,
				loader: 'babel',
				query: config.babel
			},

			{
				test: /\.styl$/,
				loader: `style!css?${query.stringify(config.css)}!postcss!stylus${query.stringify(config.stylus)}`
			},

			{
				test: /\.png$/,
				loader: 'url'
			}
		]
	},

	postcss: () => [autoprefixer]
};
