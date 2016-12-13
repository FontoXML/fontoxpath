module.exports = {
	entry: {
		main: './src/index.js'
	},

	output: {
		path: 'dist',
		filename: 'selectors.js',
		libraryTarget: 'commonjs'
	},

	resolve: {
		resolveLoader: {
			alias: {
				text: require.resolve('text-loader')
			}
		}
	}
};
