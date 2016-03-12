module.exports = {
	buildDir: './dist',

	babel: {
		plugins: [
			'transform-flow-strip-types',
			'transform-es2015-modules-commonjs',
			'transform-decorators-legacy'
		],
		presets: ['stage-0']
	},

	stylus: {},

	css: {}
};
