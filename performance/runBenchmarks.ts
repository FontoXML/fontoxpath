import runner from './benchmarkRunner/BenchmarkRunner';
import loadBenchmarks from './loadBenchmarks';

async function run() {
	await loadBenchmarks();
	runner.run();
}

run();
