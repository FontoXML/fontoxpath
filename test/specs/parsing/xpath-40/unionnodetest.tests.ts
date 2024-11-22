import * as chai from 'chai';
import * as slimdom from 'slimdom';

import {
	Language,
	evaluateXPathToBoolean,
	evaluateXPathToNodes,
	getBucketForSelector,
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('Union node tests', () => {
	it('is disallowed in XPath / XQuery 3.1', () => {
		const element = documentNode.createElementNS('http://fontoxml.com/ns/', 'someElement');
		chai.assert.throws(() => evaluateXPathToBoolean('self::(a | b)', element), 'XPST0003');
	});

	it('works with simple combinations', () => {
		const element = documentNode.createElementNS('', 'a');
		chai.assert.isTrue(
			evaluateXPathToBoolean('self::(a|b)', element, null, null, {
				language: Language.XPATH_4_0_LANGUAGE,
			}),
		);
	});

	it('works with simple combinations, matching the second option', () => {
		const element = documentNode.createElementNS('', 'b');
		chai.assert.isTrue(
			evaluateXPathToBoolean('self::(a|b)', element, null, null, {
				language: Language.XPATH_4_0_LANGUAGE,
			}),
		);
	});

	it('works with simple combinations, matching the second more general option', () => {
		const element = documentNode.createElementNS('', 'b');
		chai.assert.isTrue(
			evaluateXPathToBoolean('self::(a|element())', element, null, null, {
				language: Language.XPATH_4_0_LANGUAGE,
			}),
		);
	});

	it('works with simple combinations, matching none of the options', () => {
		const element = documentNode.createElementNS('', 'c');
		chai.assert.isFalse(
			evaluateXPathToBoolean('self::(a|b)', element, null, null, {
				language: Language.XPATH_4_0_LANGUAGE,
			}),
		);
	});

	it('works with simple combinations, with irregular whitspace', () => {
		const element = documentNode.createElementNS('', 'a');
		chai.assert.isTrue(
			evaluateXPathToBoolean('self::( a | b )', element, null, null, {
				language: Language.XPATH_4_0_LANGUAGE,
			}),
		);
	});

	it('works with simple combinations, in descendant indexing', () => {
		const element = documentNode.createElementNS('', 'a');
		const element2 = documentNode.createElementNS('', 'b');
		const root = documentNode.createElementNS('', 'root');

		root.appendChild(element);
		root.appendChild(element2);

		chai.assert.notSameOrderedMembers(
			evaluateXPathToNodes('self::( a | b )', root, null, null, {
				language: Language.XPATH_4_0_LANGUAGE,
			}),
			[element, element2],
		);
	});

	describe('bucketing', () => {
		it('returns type-1-or-type-2 if the selector is "self::(a|b)"', () => {
			chai.assert.equal(getBucketForSelector('self::(a|b)'), 'type-1-or-type-2');
		});
		it('returns type-1 if the selector is "self::(element(a)|element())"', () => {
			chai.assert.equal(
				getBucketForSelector('self::(element(a)|element())'),
				'type-1-or-type-2',
			);
		});
	});
});
