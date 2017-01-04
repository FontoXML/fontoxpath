var webpack = require('webpack');
var path = require('path');
// Karma configuration
// Generated on Tue Jan 03 2017 15:05:21 GMT+0100 (CET)

module.exports = config => {
	config.set({

		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: '',


		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ['mocha', 'sinon-chai'],


		// list of files / patterns to load in the browser
		files: [
			'test/**/*.tests.js'
		],


		// list of files to exclude
		exclude: [
		],


		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
			'test/**/*.tests.js': ['webpack'],
			'src/**/*.js': ['webpack']
		},


		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: ['spec'],


		// web server port
		port: 9876,


		// enable / disable colors in the output (reporters and logs)
		colors: true,


		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO,


		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: true,


		// start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		browsers: [],//['Chrome', 'Firefox'],


		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: false,

		// Concurrency level
		// how many browser should be started simultaneous
		concurrency: Infinity,

		webpack: {
			resolve: {
				root: ['platform', '.'],
				alias: {
					'fontoxml-selectors': path.resolve('./src'),
					'slimdom': 'fontoxml-vendor-slimdom/src/main.js',
					'fontoxml-blueprints': 'fontoxml-blueprints/src',
					'fontoxml-dom-utils': 'fontoxml-dom-utils/src'
				}
			},
			module: {
				loaders: [
					{
						loader: 'babel-loader',
						test: /.js$/,
						include: [path.resolve('src'), path.resolve('test')],
						query: {
							presets: [
								'babel-preset-es2015'
							]
						}
					}
				]
			}
		},

		plugins: [
			webpack,
			'karma-webpack',
			'istanbul-instrumenter-loader',
			'karma-mocha',
			'karma-coverage',
			'karma-chrome-launcher',
			'karma-sinon-chai',
			'karma-firefox-launcher',
			'karma-spec-reporter'
		],

		client: {
			mocha: {
				reporter: 'html'
			}
		}
	});
};
