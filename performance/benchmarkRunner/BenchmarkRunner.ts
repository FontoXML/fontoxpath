import BenchmarkCollection from './BenchmarkCollection';
import OnlyBenchmarks from './OnlyBenchmarks';

class BenchmarkRunner extends BenchmarkCollection {
	private readonly _only: OnlyBenchmarks = new OnlyBenchmarks();

	public get only(): BenchmarkCollection {
		return this._only;
	}

	public run(): void {
		let benchmarks = this._benchmarks;
		let comparisons = this._comparisons;
		if (this._only.hasBenchmarks()) {
			benchmarks = this._only.getBenchmarks();
			comparisons = this._only.getComparisons();
		}

		console.log(`Running ${benchmarks.length} benchmarks`);
		for (const benchmark of benchmarks) {
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

		console.log(`Running ${comparisons.length} comparisons`);
		for (const comparison of comparisons) {
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
