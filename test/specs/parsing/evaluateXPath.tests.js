import chai from 'chai';
import * as slimdom from 'slimdom';
import sinon from 'sinon';

import {
	domFacade,
	evaluateXPath,
	evaluateXPathToArray,
	evaluateXPathToBoolean,
	evaluateXPathToFirstNode,
	evaluateXPathToMap,
	evaluateXPathToNodes,
	evaluateXPathToNumber,
	evaluateXPathToNumbers,
	evaluateXPathToString,
	evaluateXPathToStrings
} from 'fontoxpath';

import jsonMlMapper from 'test-helpers/jsonMlMapper';

describe('evaluateXPath', () => {
	let documentNode;
	beforeEach(() => {
		documentNode = new slimdom.Document();
	});

	it('Keeps booleans booleans', () => chai.assert.equal(evaluateXPath('true()', documentNode, domFacade), true));
	it('Keeps numbers numbers', () => chai.assert.equal(evaluateXPath('1', documentNode, domFacade), 1));
	it('Keeps strings strings', () => chai.assert.equal(evaluateXPath('"string"', documentNode, domFacade), 'string'));
	it('Keeps nodes nodes', () => chai.assert.equal(evaluateXPath('.', documentNode, domFacade), documentNode));
	it('Keeps arrays arrays', () => chai.assert.deepEqual(evaluateXPath('[1,2,3]', documentNode, domFacade), [1, 2, 3]));
	it('Keeps maps maps', () => chai.assert.deepEqual(evaluateXPath('map{1:2,"a":"b"}', documentNode, domFacade), { 1: 2, a: 'b' }));

	it('returns the correct number of results', () => {
		chai.assert.equal(evaluateXPath('(1 to 250)').length, 250);
	});
	it('Returns the value of attribute nodes', () => {
		jsonMlMapper.parse([
			'someElement',
			{ someAttribute: 'someValue' },
			'Some data'
		], documentNode);
		chai.assert.equal(evaluateXPath('//@*', documentNode, domFacade), 'someValue');
	});
		it(
			'throws for async results',
			() => chai.assert.throws(() => evaluateXPath('fontoxpath:sleep(())', documentNode, domFacade), 'can not be resolved synchronously'));

	it(
		'Requires the XPath selector',
		() => chai.assert.throws(() => evaluateXPath(), 'xpathExpression must be a string'));

	describe('toBoolean', () => {
		it('Keeps booleans booleans',
			() => chai.assert.equal(evaluateXPathToBoolean('true()', documentNode, domFacade), true));

		it('Converts the result to a boolean',
			() => chai.assert.equal(evaluateXPathToBoolean('()', documentNode, domFacade), false));

		it('Throws when unable to convert the result to a boolean',
			() => chai.assert.throws(() => evaluateXPathToBoolean('(1,2,3)', documentNode, domFacade)));
		it(
			'throws for async results',
			() => chai.assert.throws(() => evaluateXPathToBoolean('fontoxpath:sleep(())', documentNode, domFacade), 'can not be resolved synchronously'));
	});

	describe('toNumber', () => {
		it('Keeps numeric values numbers',
			() => chai.assert.equal(evaluateXPathToNumber('42', documentNode, domFacade), 42));

		it('returns NaN when not resolving to a singleton',
			() => chai.assert.isNaN(evaluateXPathToNumber('()', documentNode, domFacade)));

		it('Returns NaN when unable to convert the result to a number',
			() => chai.assert.isNaN(evaluateXPathToNumber('"fortytwo"', documentNode, domFacade)));

		it(
			'throws for async results',
			() => chai.assert.throws(() => evaluateXPathToNumber('fontoxpath:sleep(())', documentNode, domFacade), 'can not be resolved synchronously'));
	});

	describe('toNumbers', () => {
		it('Keeps numeric values numbers',
			() => chai.assert.deepEqual(evaluateXPathToNumbers('42', documentNode, domFacade), [42]));

		it('throws when unable to convert the result to a number',
			() => chai.assert.throws(() => evaluateXPathToNumbers('"fortytwo"', documentNode, domFacade), 'to resolve to numbers'));

		it(
			'throws for async results',
			() => chai.assert.throws(() => evaluateXPathToNumbers('fontoxpath:sleep(())', documentNode, domFacade), 'can not be resolved synchronously'));
	});

	describe('toString', () => {
		it('Keeps string values strings',
			() => chai.assert.equal(evaluateXPathToString('"A piece of text"', documentNode, domFacade), 'A piece of text'));
		it('Makes strings from nodes', () => {
			documentNode.appendChild(documentNode.createElement('element'));
			documentNode.documentElement.appendChild(documentNode.createTextNode('A piece of text'));
			chai.assert.equal(evaluateXPathToString('.', documentNode, domFacade), 'A piece of text');
		});
		it('Stringifies numeric types',
			() => chai.assert.equal(evaluateXPathToString('42', documentNode, domFacade), '42'));

		it('Returns the empty string when resolving to the empty sequence',
			() => chai.assert.equal(evaluateXPathToString('()', documentNode, domFacade), ''));
		it(
			'throws for async results',
			() => chai.assert.throws(() => evaluateXPathToString('fontoxpath:sleep(())', documentNode, domFacade), 'can not be resolved synchronously'));
	});

	describe('toStrings', () => {
		it('Keeps string values strings',
			() => chai.assert.deepEqual(evaluateXPathToStrings('("A piece of text", "another piece of text")', documentNode, domFacade), ['A piece of text', 'another piece of text']));

		it('Stringifies numeric types',
			() => chai.assert.deepEqual(evaluateXPathToStrings('(42, 42)', documentNode, domFacade), ['42', '42']));

		it('returns an empty array when it resolves to the empty sequence',
			() => chai.assert.deepEqual(evaluateXPathToStrings('()', documentNode, domFacade), []));
		it(
			'throws for async results',
			() => chai.assert.throws(() => evaluateXPathToStrings('fontoxpath:sleep(())', documentNode, domFacade), 'can not be resolved synchronously'));
	});

	describe('toFirstNode', () => {
		it('Keeps nodes nodes',
			() => chai.assert.equal(evaluateXPathToFirstNode('.', documentNode, domFacade), documentNode));

		it('Only returns the first node',
			() => chai.assert.equal(evaluateXPathToFirstNode('(., ., .)', documentNode, domFacade), documentNode));

		it('Returns null when the xpath resolves to the empty sequence',
			() => chai.assert.equal(evaluateXPathToFirstNode('()', documentNode, domFacade), null));

		it('Throws when the xpath resolves to an attribute', () => {
			jsonMlMapper.parse(['someElement', {
				someAttribute: 'someValue'
			}], documentNode);
			chai.assert.equal(evaluateXPathToFirstNode('//@someAttribute', documentNode, domFacade), documentNode.documentElement.attributes[0]);
		});
		it('Throws when the xpath resolves to not a node', () => {
			chai.assert.throws(() => evaluateXPathToFirstNode('1', documentNode, domFacade));
		});
		it(
			'throws for async results',
			() => chai.assert.throws(() => evaluateXPathToFirstNode('fontoxpath:sleep(())', documentNode, domFacade), 'can not be resolved synchronously'));
	});

	describe('toNodes', () => {
		it('Keeps nodes nodes',
			() => chai.assert.deepEqual(evaluateXPathToNodes('.', documentNode, domFacade), [documentNode]));

		it('Returns all nodes',
			() => chai.assert.deepEqual(evaluateXPathToNodes('(., ., .)', documentNode, domFacade), [documentNode, documentNode, documentNode]));

		it('Returns null when the xpath resolves to the empty sequence',
			() => chai.assert.deepEqual(evaluateXPathToNodes('()', documentNode, domFacade), []));

		it('Throws when the xpath resolves to not a node', () => {
			chai.assert.throws(() => evaluateXPathToNodes('1', documentNode, domFacade));
		});

		it('Throws when the xpath resolves to an attribute', () => {
			jsonMlMapper.parse(['someElement', {
				someAttribute: 'someValue'
			}], documentNode);
			chai.assert.deepEqual(evaluateXPathToNodes('//@someAttribute', documentNode, domFacade), documentNode.documentElement.attributes);
		});
		it(
			'throws for async results',
			() => chai.assert.throws(() => evaluateXPathToNodes('fontoxpath:sleep(())', documentNode, domFacade), 'can not be resolved synchronously'));
	});

	describe('toArray', () => {
		it('returns a singleton array', () => {
			chai.assert.deepEqual(evaluateXPathToArray('[1,2,3]'), [1, 2, 3]);
		});
		it('returns a nested array', () => {
			chai.assert.deepEqual(evaluateXPathToArray('[1, [2, 2.5], 3]'), [1, [2, 2.5], 3]);
		});
		it('Transfroms singleton sequences to null', () => {
			chai.assert.deepEqual(evaluateXPathToArray('[1, (), 3]'), [1, null, 3]);
		});
		it('throws for arrays with sequences', () => {
			chai.assert.throws(() => evaluateXPathToArray('[1, (2, 2.5), 3]'), 'Serialization error');
		});
		it(
			'throws for async results',
			() => chai.assert.throws(() => evaluateXPathToArray('fontoxpath:sleep(())', documentNode, domFacade), 'can not be resolved synchronously'));
	});

	describe('toMap', () => {
		it('returns a simple map', () => {
			chai.assert.deepEqual(evaluateXPathToMap('map{1:2}'), { 1: 2 });
		});
		it('returns a nested map', () => {
			chai.assert.deepEqual(evaluateXPathToMap('map{1:map{2:3}}'), { 1: { 2: 3 } });
		});
		it('Transfroms singleton sequences to null', () => {
			chai.assert.deepEqual(evaluateXPathToMap('map{1:()}'), { 1: null });
		});
		it('throws for maps with sequences', () => {
			chai.assert.throws(() => evaluateXPathToMap('map{1:(2,3)}'), 'Serialization error');
		});
		it(
			'throws for async results',
			() => chai.assert.throws(() => evaluateXPathToMap('fontoxpath:sleep(())', documentNode, domFacade), 'can not be resolved synchronously'));
	});

	describe('namespaceResolver', () => {
		it('can resolve the built-in namespaces', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('xs:QName("fn:string") => namespace-uri-from-QName() eq "http://www.w3.org/2005/xpath-functions"'), 'fn');
			chai.assert.isTrue(evaluateXPathToBoolean('xs:QName("xs:string") => namespace-uri-from-QName() eq "http://www.w3.org/2001/XMLSchema"'), 'xs');
			chai.assert.isTrue(evaluateXPathToBoolean('xs:QName("map:merge") => namespace-uri-from-QName() eq "http://www.w3.org/2005/xpath-functions/map"'), 'map');
			chai.assert.isTrue(evaluateXPathToBoolean('xs:QName("array:sort") => namespace-uri-from-QName() eq "http://www.w3.org/2005/xpath-functions/array"'), 'array');
			chai.assert.isTrue(evaluateXPathToBoolean('xs:QName("math:pi") => namespace-uri-from-QName() eq "http://www.w3.org/2005/xpath-functions/math"'), 'math');
		});

		it('can resolve using the passed element', () => {
			const ele = documentNode.createElementNS('http://example.com/ns', 'element');
			chai.assert.isTrue(evaluateXPathToBoolean('xs:QName("something-without-a-prefix") => namespace-uri-from-QName() eq "http://example.com/ns"', ele));
		});

		it('can resolve using the passed resolver', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('xs:QName("xxx:yyy") => namespace-uri-from-QName() eq "http://example.com/ns"', null, null, null, { namespaceResolver: () => 'http://example.com/ns' }));
		});
	});

	describe('nodesFactory', () => {
		it('can use the passed nodesFactory', () => {
			const slimdomDocument = new slimdom.Document();
			const nodesFactory = {
				createComment: sinon.spy(slimdomDocument, 'createComment').bind(slimdomDocument),
				createElementNS: sinon.spy(slimdomDocument, 'createElementNS').bind(slimdomDocument),
				createProcessingInstruction: sinon.spy(slimdomDocument, 'createProcessingInstruction').bind(slimdomDocument),
				createTextNode: sinon.spy(slimdomDocument, 'createTextNode').bind(slimdomDocument)
			};

			evaluateXPathToBoolean('<element>Some text, a <?processing instruction ?> and a <!--comment--></element>', null, null, null, { nodesFactory, language: 'XQuery3.1' });

			chai.assert.isTrue(slimdomDocument.createComment.called, 'nodesFactory.createComment');
			chai.assert.isTrue(slimdomDocument.createElementNS.called, 'nodesFactory.createElementNS');
			chai.assert.isTrue(slimdomDocument.createProcessingInstruction.called, 'nodesFactory.createProcessingInstruction');
			chai.assert.isTrue(slimdomDocument.createTextNode.called, 'nodesFactory.createTextNode');
		});

		it('defaults to the passed document', () => {
			const slimdomDocument = new slimdom.Document();
			sinon.spy(slimdomDocument, 'createComment').bind(slimdomDocument);
			sinon.spy(slimdomDocument, 'createElementNS').bind(slimdomDocument);
			sinon.spy(slimdomDocument, 'createProcessingInstruction').bind(slimdomDocument);
			sinon.spy(slimdomDocument, 'createTextNode').bind(slimdomDocument);

			chai.assert.equal(
				evaluateXPathToFirstNode('<element>Some text, a <?processing instruction ?> and a <!--comment--></element>', slimdomDocument, null, null, { language: 'XQuery3.1' }).outerHTML,
				'<element>Some text, a <?processing instruction ?> and a <!--comment--></element>');

			chai.assert.isTrue(slimdomDocument.createComment.called, 'createComment');
			chai.assert.isTrue(slimdomDocument.createElementNS.called, 'createElementNS');
			chai.assert.isTrue(slimdomDocument.createProcessingInstruction.called, 'createProcessingInstruction');
			chai.assert.isTrue(slimdomDocument.createTextNode.called, 'createTextNode');
		});

		it('Does not error when passed a non-node with a nodetype but without the constructor functions', () => {
			chai.assert.doesNotThrow(
				() => evaluateXPathToBoolean('true()', { nodeType: 1 }, null, null, { language: 'XQuery3.1' }));
		});
	});
});
