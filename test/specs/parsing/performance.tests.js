import { evaluateXPathToNumber, evaluateXPathToBoolean } from 'fontoxpath';
import * as slimdom from 'slimdom';

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


function timeXPath (xpath, document) {
	const then = performance.now();
	chai.assert(evaluateXPathToBoolean(xpath, document), `The passed XPath ${xpath} should resolve to true`);
	const now =  performance.now();
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

	it('Makes queries exit early by streaming them and only consuming the first item', function () {
		this.timeout(10000);
		chai.assert.isAtMost(
			timeXPath('(/descendant::element()["4" = @depth]) => head() => count() = 1', document),
			fullTraversalCost * 0.5,
			'Revaluating a filtered xpath must not cost significantly more then an unfiltered one');
	});

	it('Saves variable results', function () {
		this.timeout(10000);
		const timeWithoutExtraSteps = timeXPath('(/descendant::*) => count() > 10', document);
		// Variables should only be evaluated once, not n times
		chai.assert.isAtMost(
			timeXPath('let $c := (/descendant::*) => count() return $c + $c + $c + $c + $c + $c', document),
			timeWithoutExtraSteps * 3);
	});

	it.skip('can memoize context free expressions', () => {
		// Disables because of a rather unstable CI environment
		// The filters use no context, so they must be instant
		chai.assert.isAtMost(timeXPath('(1 to 10000)[1 mod 2][1] or true()', document), 15);
	});
}

describe('performance of descendant axis', () => {
	describe('in browser DOM', () => runTests(window.document.implementation.createDocument(null, null)));
	describe('in slimdom', () => runTests(new slimdom.Document()));
});
