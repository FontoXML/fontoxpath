import { evaluateXPathToNumber, evaluateXPathToBoolean } from 'fontoxpath';
import slimdom from 'slimdom';

const cacheId = {};
describe('performance', () => {
	// Warm up the cache
	// Counting to 10 milion takes a couple of seconds.
	before(function () {
		this.timeout(100000);
		evaluateXPathToNumber('count(0 to 10000000)', document, null, {}, {cacheId});
	});

	it('can reuse cached results', function () {
		evaluateXPathToNumber('count(0 to 10000000)', document, null, {}, {cacheId});
	});

	it('can reuse cached sub-results', function () {
		chai.assert.isTrue(evaluateXPathToBoolean('10000001 = count(0 to 10000000)', document, null, {}, {cacheId}));
	});
});


let i = 0;
function timeXPath (xpath, document, skipCache) {
	i++;
	console.time(`${xpath} ${skipCache && 'NO CACHE' || 'WITH_CACHE'} ${i}`);
	const then = performance.now();
	chai.assert(evaluateXPathToBoolean(xpath, document), `The passed XPath ${xpath} should resolve to true`);
	const now =  performance.now();
	console.timeEnd(`${xpath} ${skipCache && 'NO CACHE' || 'WITH_CACHE'} ${i}`);
	return now - then;
}

function fillDocument (document, element, depth) {
	element.setAttribute('depth', depth);
	if (depth === 0) {
		return element;
	}
	var prototypeElement = element.appendChild(
		fillDocument(
			document,
			document.createElement('ele'),
			depth - 1));

	for (let i = 1, l = 10; i < l; ++i) {
		element.appendChild(prototypeElement.cloneNode(true));
	}
	return element;
}
	function runTests (document) {
		let fullTraversalCost;
		before(function () {
			this.timeout(30000);
			fillDocument(document, document.appendChild(document.createElement('root')), 5);

			fullTraversalCost = timeXPath('/descendant::element() => count() > 10', document);
		});

		it('Makes queries exit early faster by streaming them and only consuming the first item ', function () {
			this.timeout(10000);
			chai.assert.isAtMost(
				timeXPath('(/descendant::element()["4" = @depth]) => head() => count() = 1', document, false),
				fullTraversalCost * 0.5,
				'Revaluating a filtered xpath must not cost significantly more then an unfiltered one');
		});

		it('Makes complex queries exit early faster by only consuming the first item ', function () {
			this.timeout(10000);
			const timeWithoutExtraSteps = timeXPath('(/descendant::*) => count() > 10', document, false);
			// The extra steps should not add too much of a performance regression
			chai.assert.isAtMost(
				timeXPath('(//*/*) => count() < (/descendant::*) => count()', document, false),
				150 * timeWithoutExtraSteps,
				'Revaluating an indirect query is harder');
		});

		it('Makes queries faster by streaming them', function () {
			this.timeout(100000);
			// Warm caches

			chai.assert.isAtMost(
				timeXPath('/descendant::element()[@depth="4"] => count()', document, false),
				timeXPath('(reverse(/descendant::element()))[@depth="4"] => count()', document, false),
				'Revaluating the an filtered xpath must not cost significantly more then an unfiltered one');
		});

		it('does not get slower', function () {
			this.timeout(100000);
			let i = 0;
//			setInterval(() => timeXPath(`/descendant::element()[@depth="4"] => count() + ${i++}`, document, false), 1000);
			// chai.assert.closeTo(
			// 	timeXPath('/descendant::element()[@depth="4"] => count() + 1', document, false),
			// 	timeXPath('/descendant::element()[@depth="4"] => count() + 2', document, false),
			// 	250,
			// 	'Revaluating the an filtered xpath must not cost significantly more then an unfiltered one');
			// chai.assert.closeTo(
			// 	timeXPath('/descendant::element()[@depth="4"] => count() + 3', document, false),
			// 	timeXPath('/descendant::element()[@depth="4"] => count() + 4', document, false),
			// 	250,
			// 	'Revaluating the an filtered xpath must not cost significantly more then an unfiltered one');
			// chai.assert.closeTo(
			// 	timeXPath('/descendant::element()[@depth="4"] => count() + 5', document, false),
			// 	timeXPath('/descendant::element()[@depth="4"] => count() + 6', document, false),
			// 	250,
			// 	'Revaluating the an filtered xpath must not cost significantly more then an unfiltered one');
		});
	}

describe('performance of descendant axis', () => {
	describe('in browser DOM', () => runTests(window.document.implementation.createDocument(null, null)));
	describe('in slimdom', () => runTests(slimdom.createDocument()));
});
