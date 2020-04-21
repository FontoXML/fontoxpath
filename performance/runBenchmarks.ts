import runner from './BenchmarkRunner';
import loadBenchmarks from './loadBenchmarks';

async function run() {
	await loadBenchmarks();
	runner.run();
}

run();
