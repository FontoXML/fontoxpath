import {
	evaluateXPathToStrings,
	evaluateXPathToString,
	domFacade
} from 'fontoxpath';
import jsonMlMapper from 'test-helpers/jsonMlMapper';
import slimdom from 'slimdom';


let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('functions over nodes', () => {
	describe('node-name()', () => {
		it('returns an empty sequence if $arg is an empty sequence', () => {
			const selector = ('node-name(())');
			chai.expect(
				evaluateXPathToStrings(selector, documentNode, domFacade)
			).to.deep.equal([]);
		});

		it('it defaults to the context item when the argument is omitted', () => {
			const selector = ('node-name()');
			jsonMlMapper.parse([
				'someElement',
				[
					'Some text.'
				]
			], documentNode);
			chai.expect(
				evaluateXPathToString(selector, documentNode.firstChild, domFacade)
			).to.equal('someElement');
		});

		it('it returns the node name of the given context', () => {
			const selector = ('node-name(.)');
			jsonMlMapper.parse([
				'someElement',
				[
					'Some text.'
				]
			], documentNode);
			chai.expect(
				evaluateXPathToString(selector, documentNode.firstChild, domFacade)
			).to.equal('someElement');
		});
	});

	describe('name()', () => {
		it(
			'returns an empty sequence if $arg is an empty sequence',
			() => chai.assert.deepEqual(evaluateXPathToStrings('name(())', documentNode, domFacade), []));

		it('it defaults to the context item when the argument is omitted', () => {
			jsonMlMapper.parse(['someElement'], documentNode);
			chai.assert.equal(evaluateXPathToString('name()', documentNode.firstChild, domFacade), 'someElement');
		});

		it('it returns the node name of the given context', () => {
			jsonMlMapper.parse(['someElement'], documentNode);
			chai.assert.equal(evaluateXPathToString('name(.)', documentNode.firstChild, domFacade), 'someElement');
		});

		it('it returns the target of a processing instruction', () => {
			jsonMlMapper.parse(['?some-pi', 'some data'], documentNode);
			chai.assert.equal(evaluateXPathToString('name(.)', documentNode.firstChild, domFacade), 'some-pi');
		});

		it('it returns the name of an attribute', () => {
			jsonMlMapper.parse(['someElement', {someAttribute: 'someValue'}], documentNode);
			chai.assert.equal(evaluateXPathToString('name(@someAttribute)', documentNode.firstChild, domFacade), 'someAttribute');
		});

		it('it returns the empty string for comments', () => {
			jsonMlMapper.parse(['!', 'some comment'], documentNode);
			chai.assert.equal(evaluateXPathToStrings('name(.)', documentNode.firstChild, domFacade), '');
		});

		it('it returns the empty string for documents', () => {
			chai.assert.equal(evaluateXPathToStrings('name(.)', documentNode, domFacade), '');
		});
	});

	describe('outermost()', () => {
		it('returns the top level nodes if the set only contains nodes and their children', () => {
			jsonMlMapper.parse(['root', ['child'], ['child', ['descendant']]], documentNode);
			chai.assert.deepEqual(
				evaluateXPathToStrings('(/root//* => outermost())!name()', documentNode, domFacade),
				['child', 'child']);
		});

		it('returns the top level nodes if the nodes are not direct children', () => {
			jsonMlMapper.parse(['root', ['child'], ['child', ['descendant']]], documentNode);
			chai.assert.deepEqual(
				evaluateXPathToStrings('(//* => outermost())!name()', documentNode, domFacade),
				['root']);
		});

		it('sorts the passed sequence', () => {
			jsonMlMapper.parse(['root', ['child1'], ['child2', ['descendant']]], documentNode);
			chai.assert.deepEqual(
				evaluateXPathToStrings('outermost((//child2 | //child1))!name()', documentNode, domFacade),
				['child1', 'child2']);
		});

		it('deduplicates the passed sequence', () => {
			jsonMlMapper.parse(['root', ['child1'], ['child2', ['descendant']]], documentNode);
			chai.assert.deepEqual(
				evaluateXPathToStrings('outermost((//child1 | //child1))!name()', documentNode, domFacade),
				['child1']);
		});

		it('keeps attribute nodes', () => {
			jsonMlMapper.parse([
				'root',
				['child1', { attr: 'value' }],
				['child2', ['descendant']]], documentNode);
			chai.assert.deepEqual(
				evaluateXPathToStrings('outermost((//child2 | //@*))!name()', documentNode, domFacade),
				['attr', 'child2']);
		});

		it('returns the empty sequence when passed the empty sequence',
			() => chai.assert.deepEqual(
				evaluateXPathToStrings('outermost(())', documentNode, domFacade),
				[]));
	});

	describe('innermost()', () => {
		it('returns the bottom level nodes if the set only contains nodes and their children', () => {
			jsonMlMapper.parse(['root', ['child'], ['child', ['descendant']]], documentNode);
			chai.assert.deepEqual(
				evaluateXPathToStrings('(/root//* => innermost())!name()', documentNode, domFacade),
				['child', 'descendant']);
		});

		it('returns the bottom level nodes if the nodes are not direct children', () => {
			jsonMlMapper.parse(['root', ['child'], ['child', ['descendant']]], documentNode);
			chai.assert.deepEqual(
				evaluateXPathToStrings('(//* => innermost())!name()', documentNode, domFacade),
				['child', 'descendant']);
		});

		it('returns the bottom level nodes if the nodes are not direct children', () => {
			jsonMlMapper.parse(['root', ['child', ['descendant']], ['child', ['descendant'], ['descendant']]], documentNode);
			chai.assert.deepEqual(
				evaluateXPathToStrings('(//* => innermost())!name()', documentNode, domFacade),
				['descendant', 'descendant', 'descendant']);
		});

		it('sorts the passed sequence', () => {
			jsonMlMapper.parse(['root', ['child1'], ['child2', ['descendant']]], documentNode);
			chai.assert.deepEqual(
				evaluateXPathToStrings('innermost((//child2 | //child1))!name()', documentNode, domFacade),
				['child1', 'child2']);
		});

		it('deduplicates the passed sequence', () => {
			jsonMlMapper.parse(['root', ['child1'], ['child2', ['descendant']]], documentNode);
			chai.assert.deepEqual(
				evaluateXPathToStrings('innermost((//child1 | //child1))!name()', documentNode, domFacade),
				['child1']);
		});

		it('does not remove attribute nodes', () => {
			jsonMlMapper.parse([
				'root',
				['child1', { attr: 'value' }],
				['child2', ['descendant']]], documentNode);
			chai.assert.deepEqual(
				evaluateXPathToStrings('innermost((//child2 | //child1 | //@*))!name()', documentNode, domFacade),
				['attr', 'child2']);
		});

		it('returns the empty sequence when passed the empty sequence',
			() => chai.assert.deepEqual(
				evaluateXPathToStrings('innermost(())', documentNode, domFacade),
				[]));
	});
});
