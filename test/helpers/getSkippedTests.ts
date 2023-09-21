import testFs from './testFs';

export function getSkippedTests(filename) {
	const skippedTests = testFs.readFileSync(filename).split(/\r?\n/);
	if (process.argv.indexOf('--regenerate') !== -1) {
		const skipIndex =
			skippedTests.indexOf(
				'=====================TESTS ABOVE HAVE BEEN MARKED MANUALLY=====================',
			) + 1;
		skippedTests.splice(skipIndex);
	}
	return skippedTests;
}
