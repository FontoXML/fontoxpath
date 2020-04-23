import Benchmark from 'benchmark';
import BenchmarkCollection from './BenchmarkCollection';

export default class OnlyBenchmarks extends BenchmarkCollection {
	public getBenchmarks(): {
		benchmark: Benchmark;
		setup?: () => void;
		teardown?: () => void;
	}[] {
		return this._benchmarks;
	}

	public getComparisons(): {
		benchmarks: Benchmark[];
		name: string;
		setup?: () => void;
		teardown?: () => void;
	}[] {
		return this._comparisons;
	}

	public hasBenchmarks(): boolean {
		return this._benchmarks.length !== 0 || this._comparisons.length !== 0;
	}
}
