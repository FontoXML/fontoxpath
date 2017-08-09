import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

import {
	evaluateXPathToBoolean,
	evaluateXPathToNumber,
	evaluateXPathToAsyncIterator
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('for expressions', () => {
	it('works', () => {
		chai.assert.isTrue(evaluateXPathToBoolean('(for $i in (1 to 10) return $i) => count() = 10', documentNode));
	});
	it('can be chained', () => {
		chai.assert.equal(evaluateXPathToNumber('(for $i in (1 to 10), $y in (1 to $i) return $y) => count()', documentNode), 55);
	});
	it('can be chained multiple times', () => {
		chai.assert.equal(evaluateXPathToNumber('(for $i in (1 to 10), $y in (1 to $i), $z in ($y to $i) return $z) => count()', documentNode), 220);
	});
	it('can be multiple times over nodes, without deduplication, sorting, or whatever', () => {
		jsonMlMapper.parse([
			'someElement',
			[
				'someElement',
				['someElement', { 'someAttribute': 'someValue' }],
				['someElement', { 'someAttribute': 'someValue' }]
			],
			[
				'someElement',
				['someElement', { 'someAttribute': 'someValue' }],
				['someElement', { 'someAttribute': 'someValue' }]
			],
			[
				'someElement',
				['someElement', { 'someAttribute': 'someValue' }],
				['someElement', { 'someAttribute': 'someValue' }]
			]
		], documentNode);
		chai.assert.equal(evaluateXPathToNumber('(let $roots := /someElement return for $ele in $roots/someElement, $y in $ele/../someElement, $z in $y/someElement return $z/@*) => count()', documentNode), 18);
	});
	it('can be chained, including asyncness', async () => {
		const it = evaluateXPathToAsyncIterator(`
(for $i in ((1 to 10)), $x in (1 to 10 => fontoxpath:sleep(1))
		return ("blerp" || $i || "~" || $x) ) => count()
`, documentNode);
		chai.assert.equal((await it.next()).value, 100);
		chai.assert.isTrue((await it.next()).done);
	});

});
