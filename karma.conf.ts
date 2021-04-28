module.exports = function (config) {
	config.set({
		frameworks: ['mocha', 'chai', 'karma-typescript'],
		files: ['src/**/*.ts', 'test/browsertests.ts'],
		preprocessors: {
			'src/**/*.ts': 'karma-typescript',
			'test/browsertests.ts': 'karma-typescript',
		},
		reporters: ['progress'],
		port: 9876, // karma web server port
		colors: true,
		logLevel: config.LOG_INFO,
		browsers: ['ChromeHeadless', 'FirefoxHeadless'],
		autoWatch: false,
		singleRun: true,
		concurrency: Infinity,
		karmaTypescriptConfig: {
			tsconfig: 'test/tsconfig.json',
		},
	});
};
