// Import the Performance interface locally to this file
/// <reference lib="dom" />

import evaluableExpressionToString from './parsing/evaluableExpressionToString';
import { EvaluableExpression } from '.';

let profilingEnabled = false;

let performance: Performance = null;

/**
 * Describes the performance of a single XPath across multiple evaluations.
 *
 * See {@link profiler}.
 *
 * @public
 */
export declare type XPathPerformanceMeasurement = {
	average: number;
	times: number;
	totalDuration: number;
	xpath: string;
};

/**
 * Offers tooling to profile how much time is being spent running XPaths.
 *
 * Note that Javascript custom functions are also included in the profile. If they call new XPaths
 * themselves, they may overlap in measurement.
 *
 * For example, the xpath `app:custom-function("a", "b")` calls a new XPath, the total time taken for
 * that outer XPath will include the time taken for the inner one as well.
 *
 * @example
 * import \{ evaluateXPathToNodes, profiler \} from 'fontoxpath';
 * // For browsers:
 * profiler.setPerformanceImplementation(window.performance)
 * // For NodeJS:
 * profiler.setPerformanceImplementation(global.performance)
 *
 * profiler.startProfiling();
 * // Do loads of XPaths
 * profiler.stopProfiling();
 *
 * const performanceSummary = profiler.getPerformanceSummary();
 *
 * // Do whatever with this profiler result
 * console.log(`The most expensive XPath was ${performanceSummary[0].xpath}`);
 *
 * @public
 */
export declare type Profiler = {
	/**
	 * Get the performance metrics of executed XPaths between the {@link Profiler.startProfiling}
	 * and {@link Profiler.stopProfiling} calls.
	 *
	 * @returns Returns an array of {@link XPathPerformanceMeasurement} items which can be
	 * coverted into a csv to paste in your favorite spreadsheet editor. Results are ordered by their total duration.
	 *
	 * @example
	 * const summary = profiler.getPerformanceSummary();
	 * const csv = summary.map(item =\>
	 *     `${item.xpath},${item.times},${item.average},${item.totalDuration}`);
	 * await navigator.clipboard.writeText(csv);
	 *
	 * @public
	 *
	 */
	getPerformanceSummary(): XPathPerformanceMeasurement[];

	/**
	 * Set the impormentation of the Performance API object. this should implement the Performance interface.
	 *
	 * This is usually either window.performance (in the Browser) or global.performance (for NodeJS)
	 *
	 * @public
	 */
	setPerformanceImplementation(performance: Performance): void;

	/**
	 * Start profiling XPaths. All marks are cleared. Use {@link Profiler.stopProfiling} to stop it again.
	 *
	 * @public
	 */
	startProfiling(): void;

	/**
	 * Stop profiling XPaths, use the {@link Profiler.getPerformanceSummary} function to get hold of the
	 * summarized results.
	 *
	 * @public
	 */
	stopProfiling(): void;
};

/**
 * @public
 */
export const profiler: Profiler = {
	getPerformanceSummary() {
		const xpathEntries = performance.getEntriesByType('measure').filter((entry) => {
			return entry.name.startsWith('XPath: ');
		});

		return Array.from(
			xpathEntries
				.reduce((summedMeasurements, measurement) => {
					const xpath = measurement.name.substring('XPath: '.length);
					if (summedMeasurements.has(xpath)) {
						const summedMeasurement = summedMeasurements.get(xpath);
						summedMeasurement.times += 1;
						summedMeasurement.totalDuration += measurement.duration;
					} else {
						summedMeasurements.set(xpath, {
							xpath,
							times: 1,
							totalDuration: measurement.duration,
							average: 0,
						});
					}

					return summedMeasurements;
				}, new Map<string, XPathPerformanceMeasurement>())
				.values()
		)
			.map((entry) => {
				entry.average = entry.totalDuration / entry.times;
				return entry;
			})
			.sort((entryA, entryB) => {
				return entryB.totalDuration - entryA.totalDuration;
			});
	},

	setPerformanceImplementation(newPerformanceImplementation: Performance) {
		performance = newPerformanceImplementation;
	},

	startProfiling() {
		if (performance === null) {
			throw new Error(
				'Performance API object must be set using `profiler.setPerformanceImplementation` before starting to profile'
			);
		}
		performance.clearMarks();
		performance.clearMeasures();
		profilingEnabled = true;
	},

	stopProfiling() {
		profilingEnabled = false;
	},
};

let xpathDepth = 0;
function buildKey(xpath: string) {
	return `${xpath}${xpathDepth === 0 ? '' : '@' + xpathDepth}`;
}
export function markXPathStart(xpath: string | EvaluableExpression) {
	if (!profilingEnabled) {
		return;
	}

	if (typeof xpath !== 'string') {
		xpath = evaluableExpressionToString(xpath as EvaluableExpression);
	}

	performance.mark(buildKey(xpath));
	xpathDepth++;
}
export function markXPathEnd(xpath: string | EvaluableExpression) {
	if (!profilingEnabled) {
		return;
	}
	if (typeof xpath !== 'string') {
		xpath = evaluableExpressionToString(xpath as EvaluableExpression);
	}

	// Replace the mark with a measure of the time spent
	xpathDepth--;
	const xpathPerfEntry = buildKey(xpath);
	performance.measure(`XPath: ${xpath}`, xpathPerfEntry);
	performance.clearMarks(xpathPerfEntry);
}
