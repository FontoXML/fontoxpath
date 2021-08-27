import * as chai from 'chai';
import { evaluateXPathToBoolean, profiler, registerCustomXPathFunction } from 'fontoxpath';
import * as slimdom from 'slimdom';

function timeXPath(xpath, document) {
	const then = Date.now();
	chai.assert(
		evaluateXPathToBoolean(xpath, document),
		`The passed XPath ${xpath} should resolve to true`
	);
	const now = Date.now();
	return now - then;
}

function fillDocument(document, element, depth) {
	element.setAttribute('depth', depth);
	if (depth === 0) {
		return element;
	}
	const prototypeElement = element.appendChild(
		fillDocument(document, document.createElement('ele'), depth - 1)
	);

	for (let i = 1, l = 10; i < l; ++i) {
		element.appendChild(prototypeElement.cloneNode(true));
	}
	return element;
}
function runTests(document) {
	let fullTraversalCost;
	before(function () {
		this.timeout(30000);
		fillDocument(document, document.appendChild(document.createElement('root')), 5);

		fullTraversalCost = timeXPath('/descendant::element() => count() > 10', document);
	});

	it('Makes queries exit early by streaming them and only consuming the first item', function () {
		this.timeout(10000);
		chai.assert.isAtMost(
			timeXPath('(/descendant::element()["4" = @depth]) => head() => count() = 1', document),
			fullTraversalCost * 0.5,
			'Revaluating a filtered xpath must not cost significantly more then an unfiltered one'
		);
	});

	it('Saves variable results', function () {
		this.timeout(10000);
		const timeWithoutExtraSteps = timeXPath('(/descendant::*) => count() > 10', document);
		// Variables should only be evaluated once, not n times
		chai.assert.isAtMost(
			timeXPath(
				'let $c := (/descendant::*) => count() return $c + $c + $c + $c + $c + $c',
				document
			),
			timeWithoutExtraSteps * 3
		);
	});

	it.skip('can memoize context free expressions', () => {
		// Disables because of a rather unstable CI environment
		// The filters use no context, so they must be instant
		chai.assert.isAtMost(timeXPath('(1 to 10000)[1 mod 2][1] or true()', document), 15);
	});
}

describe('performance of descendant axis', () => {
	describe('in slimdom', () => runTests(new slimdom.Document()));
});

describe('measuring performance', () => {
	let now;
	before(() => {
		registerCustomXPathFunction(
			'perftest:syncsleep',
			['item()'],
			'item()?',
			(_, shouldRecurse) => {
				now++;
				if (shouldRecurse) {
					const toReturn = evaluateXPathToBoolean(
						'perftest:syncsleep($shouldRecurse)',
						null,
						null,
						{
							shouldRecurse: !shouldRecurse,
						}
					);
					now++;
					return toReturn;
				}
				return shouldRecurse;
			}
		);
	});
	beforeEach(() => {
		now = 0;
		const marks = new Map<string, PerformanceEntry>();
		const measures = new Set<PerformanceEntry>();
		const perfImplementationStub: Performance = {
			getEntriesByType(_typeString: string) {
				return Array.from(measures.values());
			},
			mark(key: string) {
				marks.set(key, {
					name: key,
					startTime: now,
					entryType: 'mark',
					duration: 0,
					toJSON: () => '',
				});
			},
			clearMeasures() {
				measures.clear();
			},
			clearMarks(key: string) {
				if (key === undefined) {
					marks.clear();
				}
				marks.delete(key);
			},
			measure(newKey: string, startMark: string) {
				const startTime = marks.get(startMark).startTime;
				measures.add({
					name: newKey,
					startTime,
					entryType: 'measure',
					duration: now - startTime,
					toJSON: () => '',
				});
			},
		} as unknown as Performance;
		profiler.setPerformanceImplementation(perfImplementationStub);
	});

	after(() => {
		profiler.stopProfiling();
	});
	it('correctly measures xpaths', () => {
		profiler.startProfiling();
		chai.assert.isFalse(evaluateXPathToBoolean('perftest:syncsleep(false())'));
		profiler.stopProfiling();
		const summ = profiler.getPerformanceSummary();

		chai.assert.equal(summ.length, 1, 'length');
		chai.assert.equal(summ[0].xpath, 'perftest:syncsleep(false())', 'name of xpath');
		chai.assert.equal(summ[0].times, 1, 'times executed');
		chai.assert.equal(summ[0].average, 1, 'average time taken');
		chai.assert.equal(summ[0].totalDuration, 1, 'total time taken');
	});

	it('correctly measures xpaths after a stop/start cycle', () => {
		profiler.startProfiling();
		chai.assert.isFalse(evaluateXPathToBoolean('perftest:syncsleep(false())'));
		profiler.stopProfiling();
		const summ = profiler.getPerformanceSummary();

		chai.assert.equal(summ.length, 1, 'length');
		chai.assert.equal(summ[0].xpath, 'perftest:syncsleep(false())', 'name of xpath');
		chai.assert.equal(summ[0].times, 1, 'times executed');
		chai.assert.equal(summ[0].average, 1, 'average time taken');
		chai.assert.equal(summ[0].totalDuration, 1, 'total time taken');

		profiler.startProfiling();
		chai.assert.isFalse(evaluateXPathToBoolean('perftest:syncsleep(false())'));
		profiler.stopProfiling();
		const summ2 = profiler.getPerformanceSummary();
		chai.assert.equal(summ2.length, 1, 'length');
		chai.assert.equal(summ2[0].xpath, 'perftest:syncsleep(false())', 'name of xpath');
		chai.assert.equal(summ2[0].times, 1, 'times executed');
		chai.assert.equal(summ2[0].average, 1, 'average time taken');
		chai.assert.equal(summ2[0].totalDuration, 1, 'total time taken');
	});

	it('correctly measures adjacent xpaths', () => {
		profiler.startProfiling();
		chai.assert.isFalse(evaluateXPathToBoolean('perftest:syncsleep(false())'));
		chai.assert.isFalse(evaluateXPathToBoolean('perftest:syncsleep(false())'));
		chai.assert.isFalse(evaluateXPathToBoolean('perftest:syncsleep(false())'));
		chai.assert.isFalse(evaluateXPathToBoolean('perftest:syncsleep(false())'));
		profiler.stopProfiling();
		const summ = profiler.getPerformanceSummary();

		chai.assert.equal(summ.length, 1, 'length');
		chai.assert.equal(summ[0].xpath, 'perftest:syncsleep(false())', 'name of xpath');
		chai.assert.equal(summ[0].times, 4, 'times executed');
		chai.assert.equal(summ[0].average, 1, 'average time taken');
		chai.assert.equal(summ[0].totalDuration, 4, 'total time taken');
	});

	it('correctly measures nested xpaths', () => {
		profiler.startProfiling();
		chai.assert.isFalse(
			evaluateXPathToBoolean('perftest:syncsleep($shouldRecurse)', null, null, {
				shouldRecurse: true,
			})
		);
		profiler.stopProfiling();
		const summ = profiler.getPerformanceSummary();

		chai.assert.equal(summ.length, 1, 'length');
		chai.assert.equal(summ[0].xpath, 'perftest:syncsleep($shouldRecurse)', 'name of xpath');
		chai.assert.equal(summ[0].times, 2, 'times executed');
		chai.assert.equal(summ[0].average, 2, 'average time taken. outer takes 2, inner 1');
		chai.assert.equal(summ[0].totalDuration, 4, 'total time taken. outer takes 2, inner 1');
	});
});
