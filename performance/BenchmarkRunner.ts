import Benchmark from 'benchmark';

class BenchmarkRunner {
	private readonly _benchmarks: {
		benchmark: Benchmark;
		setup?: () => void;
		teardown?: () => void;
	}[] = [];
	private readonly _comparisons: {
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
			// We do not use the setup and teardown which is offered withing the API of benchmarkjs
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
	) {
		// We do not use the setup and teardown which is offered withing the API of benchmarkjs
		// as several attempts to get this working did not yield any successful results. We also
		// allow only 1 setup and teardown as all functions which compare with one another should
		// use the same data to test with.
		const comparison = { name, benchmarks: [], setup, teardown };
		for (const benchmark of benchmarks) {
			comparison.benchmarks.push(new Benchmark(benchmark.name, benchmark.test));
		}
		this._comparisons.push(comparison);
	}

	public run(): void {
		console.log(`Running ${this._benchmarks.length} benchmarks`);
		for (const benchmark of this._benchmarks) {
			if (benchmark.setup !== undefined) {
				benchmark.setup();
			}

			benchmark.benchmark.on('complete', (event: Event) => {
				console.log(String(event.target));

				const error = (event.target as any).error;
				if (error) {
					console.error(error);
				}
			});

			benchmark.benchmark.run({ async: false });

			if (benchmark.teardown !== undefined) {
				benchmark.teardown();
			}
		}

		console.log(`Running ${this._comparisons.length} comparisons`);
		for (const comparison of this._comparisons) {
			console.log(`------------${comparison.name}------------`);

			const operationsPerSecond: { name: string; ops: number }[] = [];
			for (const benchmark of comparison.benchmarks) {
				if (comparison.setup !== undefined) {
					comparison.setup();
				}

				benchmark.on('complete', (event: Event) => {
					console.log(String(event.target));

					const error = (event.target as any).error;
					if (error) {
						console.error(error);
					} else {
						operationsPerSecond.push({
							name: (benchmark as any).name,
							ops: (event.target as any).hz as number,
						});
					}
				});

				benchmark.run({ async: false });

				if (comparison.teardown !== undefined) {
					comparison.teardown();
				}
			}

			operationsPerSecond.sort((a, b) => a.ops - b.ops);
			const base = operationsPerSecond[0];
			for (let i = 0; i < operationsPerSecond.length; i++) {
				const ops = operationsPerSecond[i];
				if (i === 0) {
					console.log(`${ops.name} 100%`);
				} else {
					console.log(`${ops.name} ${(ops.ops / base.ops) * 100}%`);
				}
			}
		}
	}
}

const runner = new BenchmarkRunner();
export default runner;
