import { evaluateXPathToNumber, evaluateXPathToBoolean } from 'fontoxpath';

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
describe('performance of descendant axis', () => {

	let i = 0;
	function timeXPath (xpath, document, skipCache) {
		i++;
		const then = Date.now();
		console.time(`${xpath} ${skipCache && 'NO CACHE' || 'WITH_CACHE'} ${i}`);
		evaluateXPathToNumber(xpath, document, null, {}, {cacheId : skipCache ? {} : cacheId});
		console.timeEnd(`${xpath} ${skipCache && 'NO CACHE' || 'WITH_CACHE'} ${i}`);
		return Date.now() - then;
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

	let document;
	let fullTraversalCost;
	before(function () {
		this.timeout(30000);
		document = window.document.implementation.createDocument(null, null);
		fillDocument(document, document.appendChild(document.createElement('root')), 5);

		console.log(`document is large: ${document.documentElement.outerHTML.length / 1000 / 1000}`);

		// Warm up dem caches
		fullTraversalCost = timeXPath('/descendant::element() => count()', document);
	});

	it('optimizes the descendant axis', function () {
		this.timeout(250);
		chai.assert.isAtMost(timeXPath('/descendant::element() => count()', document), 15, 'Revaluating the same XPath must be instant');
	});

	it('can use partial caches to make a query faster', function () {
		this.timeout(100000);
		chai.assert.isAtMost(
			timeXPath('/descendant::element()["4" = @depth] => count()', document, false),
			timeXPath('/descendant::element()["4" = @depth] => count()', document, true),
			'Revaluating the same XPath must cost less then a full evaluation');
	});

	it('can (re)use a cache for the descendant axis', function () {
		this.timeout(300000);
		chai.assert.isAtMost(timeXPath('/descendant::element()[@depth="4"] => count()', document), fullTraversalCost, 'Revaluating the same XPath must cost less then a full evaluation');


		chai.assert.isAtMost(timeXPath('/descendant::element()[not(@depth="4")] => count()', document), fullTraversalCost, 'Revaluating the same XPath must cost less then a full evaluation');
	});
});
