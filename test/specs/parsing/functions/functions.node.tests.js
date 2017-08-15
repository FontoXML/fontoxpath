import {
	evaluateXPathToStrings,
	evaluateXPathToString
} from 'fontoxpath';

import jsonMlMapper from 'test-helpers/jsonMlMapper';
import * as slimdom from 'slimdom';
import evaluateXPathToAsyncSingleton from 'test-helpers/evaluateXPathToAsyncSingleton';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('functions over nodes', () => {
	describe('node-name()', () => {
		it('returns an empty sequence if $arg is an empty sequence',
			() => chai.assert.deepEqual(evaluateXPathToStrings('node-name(())', documentNode), []));

		it('it defaults to the context item when the argument is omitted', () => {
			jsonMlMapper.parse([
				'someElement',
				'Some text.'
			], documentNode);
			chai.assert.equal(evaluateXPathToString('node-name()', documentNode.firstChild), 'someElement');
		});

		it('it returns the node name of the given context', () => {
			jsonMlMapper.parse([
				'someElement',
				'Some text.'
			], documentNode);
			chai.assert.equal(evaluateXPathToString('node-name(.)', documentNode.firstChild), 'someElement');
		});

		it('it accepts async parameters', async () => {
			jsonMlMapper.parse([
				'someElement',
				'Some text.'
			], documentNode);
			chai.assert.equal(await evaluateXPathToAsyncSingleton('node-name(. => fontoxpath:sleep()) => string()', documentNode.firstChild), 'someElement');
		});
	});

	describe('local-name()', () => {
		it('returns the empty string if $arg is an empty sequence',
			() => chai.assert.deepEqual(evaluateXPathToString('local-name(())', documentNode), ''));

		it('it defaults to the context item when the argument is omitted', () => {
			jsonMlMapper.parse([
				'someElement',
				'Some text.'
			], documentNode);
			chai.assert.equal(evaluateXPathToString('local-name()', documentNode.firstChild), 'someElement');
		});

		it('it returns the node name of the given context', () => {
			jsonMlMapper.parse([
				'someElement',
				'Some text.'
			], documentNode);
			chai.assert.equal(evaluateXPathToString('local-name(.)', documentNode.firstChild), 'someElement');
		});

		it('it returns the PI target for PIs', () => {
			jsonMlMapper.parse([
				'?somePi',
				'With some data'
			], documentNode);
			chai.assert.equal(evaluateXPathToString('local-name(.)', documentNode.firstChild), 'somePi');
		});

		it('it accepts async parameters', async () => {
			jsonMlMapper.parse([
				'someElement',
				'Some text.'
			], documentNode);
			chai.assert.equal(await evaluateXPathToAsyncSingleton('local-name(. => fontoxpath:sleep())', documentNode.firstChild), 'someElement');
		});
	});

	describe('name()', () => {
		it('returns an empty sequence if $arg is an empty sequence',
			() => chai.assert.deepEqual(evaluateXPathToStrings('name(())', documentNode), []));

		it('it defaults to the context item when the argument is omitted', () => {
			jsonMlMapper.parse(['someElement'], documentNode);
			chai.assert.equal(evaluateXPathToString('name()', documentNode.firstChild), 'someElement');
		});

		it('it returns the name including namespace prefixes', () => {
			const element = documentNode.createElementNS('http://example.com/ns', 'ns:someElement');
			chai.assert.equal(evaluateXPathToString('name()', element), 'ns:someElement');
		});

		it('it returns the node name of the given context', () => {
			jsonMlMapper.parse(['someElement'], documentNode);
			chai.assert.equal(evaluateXPathToString('name(.)', documentNode.firstChild), 'someElement');
		});

		it('it returns the target of a processing instruction', () => {
			jsonMlMapper.parse(['?some-pi', 'some data'], documentNode);
			chai.assert.equal(evaluateXPathToString('name(.)', documentNode.firstChild), 'some-pi');
		});

		it('it returns the name of an attribute', () => {
			jsonMlMapper.parse(['someElement', { someAttribute: 'someValue' }], documentNode);
			chai.assert.equal(evaluateXPathToString('name(@someAttribute)', documentNode.firstChild), 'someAttribute');
		});

		it('it returns the empty string for comments', () => {
			jsonMlMapper.parse(['!', 'some comment'], documentNode);
			chai.assert.equal(evaluateXPathToStrings('name(.)', documentNode.firstChild), '');
		});

		it('it returns the empty string for documents', () => chai.assert.equal(evaluateXPathToStrings('name(.)', documentNode), ''));

		it('it accepts async parameters', async () => {
			jsonMlMapper.parse([
				'someElement',
				'Some text.'
			], documentNode);
			chai.assert.equal(await evaluateXPathToAsyncSingleton('name(. => fontoxpath:sleep())', documentNode.firstChild), 'someElement');
		});
	});

	describe('outermost()', () => {
		it('returns the top level nodes if the set only contains nodes and their children', () => {
			jsonMlMapper.parse(['root', ['child'], ['child', ['descendant']]], documentNode);
			chai.assert.deepEqual(evaluateXPathToStrings('(/root//* => outermost())!name()', documentNode), ['child', 'child']);
		});

		it('returns the top level nodes if the nodes are not direct children', () => {
			jsonMlMapper.parse(['root', ['child'], ['child', ['descendant']]], documentNode);
			chai.assert.deepEqual(evaluateXPathToStrings('(//* => outermost())!name()', documentNode), ['root']);
		});

		it('sorts the passed sequence', () => {
			jsonMlMapper.parse(['root', ['child1'], ['child2', ['descendant']]], documentNode);
			chai.assert.deepEqual(evaluateXPathToStrings('outermost((//child2 | //child1))!name()', documentNode), ['child1', 'child2']);
		});

		it('deduplicates the passed sequence', () => {
			jsonMlMapper.parse(['root', ['child1'], ['child2', ['descendant']]], documentNode);
			chai.assert.deepEqual(evaluateXPathToStrings('outermost((//child1 | //child1))!name()', documentNode), ['child1']);
		});

		it('keeps attribute nodes', () => {
			jsonMlMapper.parse([
				'root',
				['child1', { attr: 'value' }],
				['child2', ['descendant']]], documentNode);
			chai.assert.deepEqual(evaluateXPathToStrings('outermost((//child2 | //@*))!name()', documentNode), ['attr', 'child2']);
		});

		it('returns the empty sequence when passed the empty sequence',
			() => chai.assert.deepEqual(evaluateXPathToStrings('outermost(())', documentNode), []));

		it('accepts async parameters', async () => {
			jsonMlMapper.parse(['root', ['child'], ['child', ['descendant']]], documentNode);
			chai.assert.deepEqual(await evaluateXPathToAsyncSingleton('array{(/root//* => fontoxpath:sleep() => outermost())!name()}', documentNode), ['child', 'child']);
		});
	});

	describe('innermost()', () => {
		it('returns the bottom level nodes if the set only contains nodes and their children', () => {
			jsonMlMapper.parse(['root', ['child'], ['child', ['descendant']]], documentNode);
			chai.assert.deepEqual(evaluateXPathToStrings('(/root//* => innermost())!name()', documentNode), ['child', 'descendant']);
		});

		it('returns the bottom level nodes if the nodes are not direct children', () => {
			jsonMlMapper.parse(['root', ['child'], ['child', ['descendant']]], documentNode);
			chai.assert.deepEqual(evaluateXPathToStrings('(//* => innermost())!name()', documentNode), ['child', 'descendant']);
		});

		it('returns the bottom level nodes if the nodes are not direct children', () => {
			jsonMlMapper.parse(['root', ['child', ['descendant']], ['child', ['descendant'], ['descendant']]], documentNode);
			chai.assert.deepEqual(evaluateXPathToStrings('(//* => innermost())!name()', documentNode), ['descendant', 'descendant', 'descendant']);
		});

		it('returns the bottom level nodes across two documents', () => {
			var docA = (new DOMParser()).parseFromString('<a><b/><c/></a>', 'text/xml');
			var docB = (new DOMParser()).parseFromString('<A><B/><C/></A>', 'text/xml');
			chai.assert.deepEqual(evaluateXPathToStrings('(innermost(($docA//node(), $docB//node())))!name()', documentNode, null, { docA, docB }), ['b', 'c', 'B', 'C']);
		});

		it('sorts the passed sequence', () => {
			jsonMlMapper.parse(['root', ['child1'], ['child2', ['descendant']]], documentNode);
			chai.assert.deepEqual(evaluateXPathToStrings('innermost((//child2 | //child1))!name()', documentNode), ['child1', 'child2']);
		});

		it('deduplicates the passed sequence', () => {
			jsonMlMapper.parse(['root', ['child1'], ['child2', ['descendant']]], documentNode);
			chai.assert.deepEqual(evaluateXPathToStrings('innermost((//child1 | //child1))!name()', documentNode), ['child1']);
		});

		it('does not remove attribute nodes', () => {
			jsonMlMapper.parse([
				'root',
				['child1', { attr: 'value' }],
				['child2', ['descendant']]], documentNode);
			chai.assert.deepEqual(evaluateXPathToStrings('innermost((//child2 | //child1 | //@*))!name()', documentNode), ['attr', 'child2']);
		});

		it('returns the empty sequence when passed the empty sequence',
			() => chai.assert.deepEqual(evaluateXPathToStrings('innermost(())', documentNode), []));

		it('accepts async parameters', async () => {
			jsonMlMapper.parse(['root', ['child'], ['child', ['descendant']]], documentNode);
			chai.assert.deepEqual(await evaluateXPathToAsyncSingleton('array{(/root//* => fontoxpath:sleep() => innermost())!name()}', documentNode), ['child', 'descendant']);
		});
	});
});
