import Benchmark from 'benchmark';

export default abstract class BenchmarkCollection {
	protected readonly _benchmarks: {
		benchmark: Benchmark;
		setup?: () => void;
		teardown?: () => void;
	}[] = [];
	protected readonly _comparisons: {
		benchmarks: Benchmark[];
		name: string;
		setup?: () => void;
		teardown?: () => void;
	}[] = [];
	public addBenchmark(
		name: string,
		test: () => void,
		setup?: () => void,
		teardown?: () => void
	): void {
		this._benchmarks.push({
			benchmark: new Benchmark(name, test),
			// We do not use the setup and teardown which is offered within the API of benchmarkjs
			// as several attempts to get this working did not yield any successful results.
			setup,
			teardown,
		});
	}
	public compareBenchmarks(
		name: string,
		setup?: () => void,
		teardown?: () => void,
		...benchmarks: {
			name: string;
			test: () => void;
		}[]
	): void {
		// We do not use the setup and teardown which is offered within the API of benchmarkjs
		// as several attempts to get this working did not yield any successful results. We also
		// allow only 1 setup and teardown as all functions which compare with one another should
		// use the same data to test with.
		const comparison = { name, benchmarks: [], setup, teardown };
		for (const benchmark of benchmarks) {
			comparison.benchmarks.push(new Benchmark(benchmark.name, benchmark.test));
		}
		this._comparisons.push(comparison);
	}
}
