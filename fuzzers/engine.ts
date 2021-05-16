import { IFuzzer } from 'fuzzer';
import readline from 'readline';
const { Worker: ThreadWorker, isMainThread, parentPort, workerData } = require('worker_threads');

enum WorkerMessageTypes {
	Online = 'online',
	Progress = 'progress',
	Crash = 'crash',
}

/**
 * Multi-threaded fuzzing engine.
 */
export default class Engine<TFuzzer extends IFuzzer> {
	run(fuzzer: TFuzzer, filename: string): void {
		if (isMainThread) {
			this.run_main(filename);
		} else {
			this.run_worker(fuzzer);
		}
	}

	private run_main(filename: string): void {
		let workersOnline = 0;
		let totalCases = 0;
		const uniqueStacks = new Set();

		// Start all the workers
		const os = require('os');
		const numOfCpus = os.cpus().length;
		process.stdout.write(`Main thread, launching ${numOfCpus} workers\n`);
		for (const tid of Array(numOfCpus).keys()) {
			const worker = new ThreadWorker(
				`
				require('tsconfig-paths/register');
				require('ts-node/register');
				require(require('worker_threads').workerData.runThisFileInTheWorker);
				`,
				{
					env: {
						TS_NODE_PROJECT: './fuzzers/tsconfig.json'
					},
					eval: true,
					workerData: {
						runThisFileInTheWorker: filename,
						tid
					}
				}
			);
			worker.on('message', msg => {
				switch (msg.type) {
					case WorkerMessageTypes.Online: {
						workersOnline += 1;
						break;
					}
					case WorkerMessageTypes.Progress: {
						totalCases += msg.totalCases;
						break;
					}
					case WorkerMessageTypes.Crash: {
						// Not interested in duplicate stack traces
						// Must do this again because workers do not coordinate
						if (uniqueStacks.has(msg.stack)) {
							return;
						}
						uniqueStacks.add(msg.stack);

						// Print the error
						process.stdout.write(
							`\n\n!!! \x1b[31mCrash found\x1b[0m !!!\nSelector: ${msg.selector}\nLanguage: ${msg.language}\n${msg.stack}\n\n`
						);
						break;
					}
				}
			});
			worker.on('error', err => {
				process.stderr.write(`Unexpected error of ${tid} with error ${err}\n`);
			});
			worker.on('exit', code => {
				process.stderr.write(`Unexpected exit of ${tid} with exit code ${code}\n`);
			});
		}

		// Print stats
		let startTime = process.hrtime();
		setInterval(() => {
			// Only start the timer when at least one worker is online
			if (workersOnline === 0) {
				startTime = process.hrtime();
			}

			const elapsed = process.hrtime(startTime);
			const fcps = (totalCases / elapsed[0]).toFixed(2);
			readline.clearLine(process.stdout, 0);
			readline.cursorTo(process.stdout, 0, null);
			process.stdout.write(
				`\x1b[0m\t[Workers: \x1b[32m${workersOnline}\x1b[0m] [Total cases: \x1b[32m${totalCases}\x1b[0m] [fcps: \x1b[32m${fcps}\x1b[0m] [Unique crashes: \x1b[31m${uniqueStacks.size}\x1b[0m]`
			);
		}, 1000);
	}

	private run_worker(fuzzer: TFuzzer): void {
		// Init the fuzzer
		fuzzer.globalInit();

		// Report worker as online
		const tid = workerData.tid;
		parentPort.postMessage({
			type: WorkerMessageTypes.Online,
			tid
		});

		let deltaCases = 0;
		const uniqueStacks = new Set();
		while (true) {
			// Report progress
			if (deltaCases === 1000) {
				parentPort.postMessage({
					type: WorkerMessageTypes.Progress,
					totalCases: deltaCases,
					tid
				});
				deltaCases = 0;
			}
			deltaCases += 1;

			// Init case
			const fuzzCase = fuzzer.prepareCase();

			// Execute the case
			try {
				fuzzCase.run();
			} catch (error) {
				// Test if this is an expected error
				if (fuzzer.isExpectedError(error)) {
					continue;
				}

				// Not interested in duplicate stack traces
				if (uniqueStacks.has(error.stack)) {
					continue;
				}
				uniqueStacks.add(error.stack);

				// Report the error
				parentPort.postMessage({
					type: WorkerMessageTypes.Crash,
					selector: fuzzCase.selector,
					language: fuzzCase.language,
					stack: error.stack,
					tid
				});
			}
		}
	}
}
