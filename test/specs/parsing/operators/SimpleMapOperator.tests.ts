import * as chai from 'chai';
import {
	evaluateXPath,
	evaluateXPathToNodes,
	evaluateXPathToNumber,
	evaluateXPathToString,
	evaluateXPathToStrings,
} from 'fontoxpath';
import * as slimdom from 'slimdom';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('Simple map operator', () => {
	it('accepts two single inputs: . ! name(.)', () => {
		const element = documentNode.createElement('someElement');
		chai.assert.equal(evaluateXPathToString('. ! name(.)', element), 'someElement');
	});

	it('works in more intricate cases', () => {
		chai.assert.equal(
			evaluateXPathToString(
				'<root><a><b>FIRST</b></a><b>SECOND</b></root>!child::a!child::b',
				documentNode,
				null,
				null,
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			),
			'FIRST'
		);
	});

	it('accepts a sequence as first expression: (1, 2, 3) ! string()', () =>
		chai.assert.deepEqual(evaluateXPathToStrings('(1, 2, 3) ! string()', documentNode), [
			'1',
			'2',
			'3',
		]));

	it('accepts a sequence as second expression: "abc" ! (concat("123", .), concat(., "123"))', () =>
		chai.assert.deepEqual(
			evaluateXPathToStrings('"abc" ! (concat("123", .), concat(., "123"))', documentNode),
			['123abc', 'abc123']
		));

	it('accepts a sequence as first and as second expression: ("a", "b", "c") ! (concat("a-", .), concat("b-", .), concat("c-", .))', () =>
		chai.assert.deepEqual(
			evaluateXPathToStrings(
				'("a", "b", "c") ! (concat("a-", .), concat("b-", .), concat("c-", .))',
				documentNode
			),
			['a-a', 'b-a', 'c-a', 'a-b', 'b-b', 'c-b', 'a-c', 'b-c', 'c-c']
		));

	it('accepts being stacked: . ! (@first, @second, @last) ! string(.)', () => {
		const element = documentNode.createElement('someElement');
		element.setAttribute('first', 'a');
		element.setAttribute('second', 'b');
		element.setAttribute('last', 'z');
		chai.assert.deepEqual(
			evaluateXPathToStrings('. ! (@first, @second, @last) ! string(.)', element),
			['a', 'b', 'z']
		);
	});

	it('sets the context sequence', () =>
		chai.assert.deepEqual(
			evaluateXPathToStrings('("a", "b", "c")!position()!string()', documentNode),
			['1', '2', '3']
		));

	it('throws the correct error when mapping numbers to a child path expresion', () =>
		chai.assert.throws(() => evaluateXPathToNodes('0!child::a', documentNode), 'XPTY0020'));
	it('throws the correct error when mapping numbers to a parent path expresion', () =>
		chai.assert.throws(() => evaluateXPathToNodes('0!parent::a', documentNode), 'XPTY0020'));
	it('throws the correct error when mapping numbers to a following path expresion', () =>
		chai.assert.throws(() => evaluateXPathToNodes('0!following::a', documentNode), 'XPTY0020'));
	it('throws the correct error when mapping numbers to a following sibling path expresion', () =>
		chai.assert.throws(
			() => evaluateXPathToNodes('0!following-sibling::a', documentNode),
			'XPTY0020'
		));
	it('throws the correct error when mapping numbers to a preceding path expresion', () =>
		chai.assert.throws(() => evaluateXPathToNodes('0!preceding::a', documentNode), 'XPTY0020'));
	it('throws the correct error when mapping numbers to a descendant path expresion', () =>
		chai.assert.throws(
			() => evaluateXPathToNodes('0!descendant::a', documentNode),
			'XPTY0020'
		));
	it('throws the correct error when mapping numbers to a preceding-sibling path expresion', () =>
		chai.assert.throws(
			() => evaluateXPathToNodes('0!preceding-sibling::a', documentNode),
			'XPTY0020'
		));
	it('throws the correct error when mapping numbers to a ancestor path expresion', () =>
		chai.assert.throws(() => evaluateXPathToNodes('0!ancestor::a', documentNode), 'XPTY0020'));
	it('does not crash when mapping numbers to numbers', () =>
		chai.assert.equal(evaluateXPathToNumber('0!1', documentNode), 1));
});
