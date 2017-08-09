const webpack = require('webpack');
const path = require('path');
const runIntegrationTests = process.env.npm_config_integration_tests;
const ciMode = process.env.npm_config_ci_mode;
const coverageMode = process.env.npm_config_coverage;
const runQt3Tests = process.env.npm_config_qt3;

if (runIntegrationTests && coverageMode) {
	throw new Error('No coverage possible for integration tests.');
}

console.log(`Running ${runIntegrationTests ? 'integration' : runQt3Tests ? 'QT3' : 'unit' } tests ${coverageMode ? 'with' : 'without'} recording coverage`);

const bootstrapFile = runQt3Tests ?
	require.resolve('./test/qt3tests.js') :
	runIntegrationTests ?
		require.resolve('./test/integrationtests.js') :
		require.resolve('./test/alltests.js');

module.exports = config => {
	config.set({

		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: '',


		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ['mocha', 'sinon-chai'],


		// list of files / patterns to load in the browser
		files: [
			bootstrapFile
		],


		// list of files to exclude
		exclude: [
		],


		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
			[bootstrapFile]: ['webpack']
		},


		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: coverageMode ? ['dots', 'coverage'] : [runQt3Tests && ciMode ? 'dots' : 'spec'],


		coverageReporter: coverageMode ? {
			reporters: ciMode ? [{ type: 'text-summary' }] : [{ type: 'html' }, { type: 'text' }]
		} : [],


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
		browsers: ciMode ? ['Firefox', 'ChromiumNoSandbox'] : [],

		// The QT3 tests take a while to download
		browserNoActivityTimeout: runQt3Tests ? 200000 : 20000,

		// https://github.com/karma-runner/karma-chrome-launcher/issues/73#issuecomment-236597429
		customLaunchers: {
			ChromiumNoSandbox: {
				base: 'Chromium',
				flags: [
					'--no-sandbox',
					// We don't really care for throttling of our unit tests...
					'--disable-background-timer-throttling'
				]
			}
		},

		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: ciMode,

		// Concurrency level
		// how many browser should be started simultaneous
		// The QT3 tests are a bit much to run in parallel, so run them consecutively
		concurrency: runQt3Tests ? 1 : Infinity,

		webpack: {
			resolve: {
				alias: {
					'fontoxpath': runIntegrationTests ?
						path.resolve('./dist/fontoxpath.js') :
						path.resolve('./src'),
					'test-helpers': path.resolve('test/helpers/'),
					'assets': path.resolve('test/assets')
				}
			},
			module: {
				loaders: [{
					loader: 'babel-loader',
					test: /\.js$/,
					include: runQt3Tests ? [path.resolve('src')] :
						runIntegrationTests ?
						[path.resolve('test')] :
						[path.resolve('src'), path.resolve('test')],
					options: {
						presets: [
							[
								'env',
								{
									targets: {
										chrome: 59
									}
								}
							]
						],
						plugins: !coverageMode ? [] : [ ['istanbul', { include: ['src/**/*.js'], exclude: ['text/**/*.js'] }] ]
					}
				}]
			},
			devtool: 'eval'
		},


		webpackMiddleware: {
			stats: {
				assets: false,
				children: false,
				chunks: false
			}
		},


		plugins: [
			webpack,
			'karma-webpack',
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
