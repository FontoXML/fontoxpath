import * as chai from 'chai';
import {
	evaluateXPath,
	evaluateXPathToAsyncIterator,
	evaluateXPathToBoolean,
	evaluateXPathToNodes,
	IDomFacade
} from 'fontoxpath';
import ExternalDomFacade from 'fontoxpath/domFacade/ExternalDomFacade';
import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

let documentNode: slimdom.Document;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

/**
 * @param  shouldNotBeTraversed  These nodes and their descendants should never be traversed.
 */
function buildDomFacade(...shouldNotBeTraversed: slimdom.Node[]): IDomFacade {
	const externalDomFacde = new ExternalDomFacade();

	const throwIfShouldNotTraversed = (node: Node) => {
		const slimdomNode = (node as any) as slimdom.Node;

		if (slimdomNode === null) {
			return;
		}
		if (shouldNotBeTraversed.includes(slimdomNode)) {
			throw new Error(
				`The node ${new slimdom.XMLSerializer().serializeToString(
					slimdomNode
				)} should not be traversed.`
			);
		}
		throwIfShouldNotTraversed(node.parentNode);
	};

	const domFacade: IDomFacade = {
		getAllAttributes: node => {
			throwIfShouldNotTraversed(node);
			return externalDomFacde.getAllAttributes(node);
		},
		getAttribute: (node, attributeName) => {
			throwIfShouldNotTraversed(node);
			return externalDomFacde.getAttribute(node, attributeName);
		},
		getChildNodes: node => {
			throwIfShouldNotTraversed(node);
			return externalDomFacde.getChildNodes(node);
		},
		getData: node => {
			throwIfShouldNotTraversed(node);
			return externalDomFacde.getData(node);
		},
		getFirstChild: node => {
			throwIfShouldNotTraversed(node);
			return externalDomFacde.getFirstChild(node);
		},
		getLastChild: node => {
			throwIfShouldNotTraversed(node);
			return externalDomFacde.getLastChild(node);
		},
		getNextSibling: node => {
			throwIfShouldNotTraversed(node);
			return externalDomFacde.getNextSibling(node);
		},
		getParentNode: node => {
			throwIfShouldNotTraversed(node);
			return externalDomFacde.getParentNode(node);
		},
		getPreviousSibling: node => {
			throwIfShouldNotTraversed(node);
			return externalDomFacde.getPreviousSibling(node);
		}
	};
	return domFacade;
}

describe('uses hints', () => {
	it('skips the subtree for outermost()', () => {
		jsonMlMapper.parse(['root', ['foo', ['foo']]], documentNode);
		const descendant = documentNode.documentElement.firstChild.firstChild;
		// It is successful when the dom facade does not throw
		const nodes = evaluateXPathToNodes(
			'outermost(descendant::foo)',
			documentNode,
			buildDomFacade(descendant)
		);

		chai.assert.deepEqual((nodes as any) as slimdom.Node[], [
			documentNode.documentElement.firstChild
		]);
	});

	it('skips the subtree for outermost() with child step expression', () => {
		jsonMlMapper.parse(['root', ['foo', ['foo']]], documentNode);
		const descendant = documentNode.documentElement.firstChild.firstChild;
		// It is successful when the dom facade does not throw
		const nodes = evaluateXPathToNodes(
			'outermost(root/descendant::foo)',
			documentNode,
			buildDomFacade(descendant)
		);

		chai.assert.deepEqual((nodes as any) as slimdom.Node[], [
			documentNode.documentElement.firstChild
		]);
	});

	it('skips the subtree for outermost() with simple map operator', () => {
		jsonMlMapper.parse(['root', ['foo', ['foo']]], documentNode);
		const descendant = documentNode.documentElement.firstChild.firstChild;
		// It is successful when the dom facade does not throw
		const nodes = evaluateXPathToNodes(
			'outermost(descendant::foo!.)',
			documentNode,
			buildDomFacade(descendant)
		);

		chai.assert.deepEqual((nodes as any) as slimdom.Node[], [
			documentNode.documentElement.firstChild
		]);
	});

	it('skips the subtree for outermost() with sequence expression', () => {
		jsonMlMapper.parse(['root', ['foo', ['foo']]], documentNode);
		const descendant = documentNode.documentElement.firstChild.firstChild;

		// It is successful when the dom facade does not throw
		let nodes = evaluateXPathToNodes(
			'outermost((descendant::foo, <bar/>))',
			documentNode,
			buildDomFacade(descendant),
			null,
			{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
		);

		nodes.sort(node => node.nodeName === 'bar' ? 1 : -1);

		chai.assert.deepEqual(nodes, evaluateXPathToNodes(
			'(root/foo, <bar/>)',
			documentNode,
			null,
			null,
			{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
		));

		// It is successful when the dom facade does not throw
		nodes = evaluateXPathToNodes(
			'outermost((<bar/>, descendant::foo))',
			documentNode,
			buildDomFacade(descendant),
			null,
			{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
		);

		nodes.sort(node => node.nodeName === 'bar' ? 1 : -1);

		chai.assert.deepEqual(nodes, evaluateXPathToNodes(
			'(root/foo, <bar/>)',
			documentNode,
			null,
			null,
			{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
		));
	});

	it('does not skip the subtree in for loop binding for outermost()', () => {
		jsonMlMapper.parse(['root', ['foo', ['foo']]], documentNode);
		chai.assert.isTrue(
			evaluateXPathToBoolean(
				'count(outermost(for $foo in descendant::foo return <a/>)) eq 2',
				documentNode,
				null,
				null,
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			)
		);
	});

	it('skips the subtree in for loop return for outermost()', () => {
		jsonMlMapper.parse(['root', ['foo', ['foo']]], documentNode);
		const descendant = documentNode.documentElement.firstChild.firstChild;
		// It is successful when the dom facade does not throw
		const nodes = evaluateXPathToNodes(
			'outermost(for $i in 1 return descendant::foo)',
			documentNode,
			buildDomFacade(descendant),
			null,
			{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
		);

		chai.assert.deepEqual((nodes as any) as slimdom.Node[], [
			documentNode.documentElement.firstChild
		]);
	});

	it('skips the subtree for outermost() with filter', () => {
		jsonMlMapper.parse(['root', ['foo', ['foo']]], documentNode);
		const descendant = documentNode.documentElement.firstChild.firstChild;
		// It is successful when the dom facade does not throw
		const nodes = evaluateXPathToNodes(
			'outermost(descendant::element()[name() eq "foo"])',
			documentNode,
			buildDomFacade(descendant),
			null,
			{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
		);

		chai.assert.deepEqual((nodes as any) as slimdom.Node[], [
			documentNode.documentElement.firstChild
		]);
	});

	it('skips the subtree for outermost() with tail', () => {
		jsonMlMapper.parse(['root', ['foo', ['foo']]], documentNode);
		const descendant = documentNode.documentElement.firstChild.firstChild;
		// It is successful when the dom facade does not throw
		const nodes = evaluateXPathToNodes(
			'outermost(tail(descendant::node()))',
			documentNode,
			buildDomFacade(descendant),
			null,
			{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
		);

		chai.assert.deepEqual((nodes as any) as slimdom.Node[], [
			documentNode.documentElement.firstChild
		]);
	});

	it('skips the subtree for outermost() with subsequence', () => {
		jsonMlMapper.parse(['root', ['foo', ['foo']]], documentNode);
		const descendant = documentNode.documentElement.firstChild.firstChild;
		// It is successful when the dom facade does not throw
		const nodes = evaluateXPathToNodes(
			'outermost(subsequence(descendant::node(), 2))',
			documentNode,
			buildDomFacade(descendant),
			null,
			{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
		);

		chai.assert.deepEqual((nodes as any) as slimdom.Node[], [
			documentNode.documentElement.firstChild
		]);
	});

	it('does not skip the subtree in for-each binding for outermost()', () => {
		jsonMlMapper.parse(['root', ['foo', ['foo']]], documentNode);
		chai.assert.isTrue(
			evaluateXPathToBoolean(
				'count(outermost(for-each(descendant::foo, function($node){<a/>}))) eq 2',
				documentNode,
				null,
				null,
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			)
		);
	});

	it('skips the subtree in foreach return for outermost()', () => {
		jsonMlMapper.parse(['root', ['foo', ['foo']]], documentNode);
		const descendant = documentNode.documentElement.firstChild.firstChild;
		// It is successful when the dom facade does not throw
		const nodes = evaluateXPathToNodes(
			'outermost(for-each(root, function($node){$node/descendant::node()}))',
			documentNode,
			buildDomFacade(descendant),
			null,
			{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
		);

		chai.assert.deepEqual((nodes as any) as slimdom.Node[], [
			documentNode.documentElement.firstChild
		]);
	});

	it('does not skip the subtree for outermost() with except', () => {
		jsonMlMapper.parse(['root', ['foo'], ['foo']], documentNode);
		chai.assert.isTrue(
			evaluateXPathToBoolean(
				'count(outermost(descendant::node() except root)) eq 2',
				documentNode,
				null,
				null,
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			)
		);
	});

	it('does not skip the subtree for outermost() with intersect', () => {
		jsonMlMapper.parse(['root', ['a'], ['b']], documentNode);
		chai.assert.isTrue(
			evaluateXPathToBoolean(
				'count(outermost(descendant::node() intersect (root/a, root/b))) eq 2',
				documentNode,
				null,
				null,
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			)
		);
	});

	it('does not skip the subtree in if binding for outermost()', () => {
		jsonMlMapper.parse(['root', ['foo', ['foo']]], documentNode);
		chai.assert.isTrue(
			evaluateXPathToBoolean(
				`count(outermost(
					if(count(descendant::foo) eq 2) then
						(<a/>,<a/>)
					else
						<a/>
				)) eq 2`,
				documentNode,
				null,
				null,
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			)
		);
	});

	it('skips the subtree in if return for outermost()', () => {
		jsonMlMapper.parse(['root', ['foo', ['foo']]], documentNode);
		const descendant = documentNode.documentElement.firstChild.firstChild;
		// It is successful when the dom facade does not throw
		const nodes = evaluateXPathToNodes(
			'outermost(if (true()) then descendant::foo else root)',
			documentNode,
			buildDomFacade(descendant),
			null,
			{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
		);

		chai.assert.deepEqual((nodes as any) as slimdom.Node[], [
			documentNode.documentElement.firstChild
		]);
	});

	it('skips the subtree for outermost() with async', async () => {
		jsonMlMapper.parse(['root', ['foo', ['foo']]], documentNode);
		const descendant = documentNode.documentElement.firstChild.firstChild;
		// It is successful when the dom facade does not throw
		const iterator = evaluateXPathToAsyncIterator(
			'outermost(fontoxpath:sleep(descendant::foo, 1))',
			documentNode,
			buildDomFacade(descendant),
			null,
			{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
		);

		const nodes = [];
		for (let item = await iterator.next(); !item.done; item = await iterator.next()) {
			nodes.push(item.value);
		}

		chai.assert.deepEqual(nodes, [documentNode.documentElement.firstChild]);
	});

	it('skips the subtree for outermost() in debug mode', () => {
		jsonMlMapper.parse(['root', ['foo', ['foo']]], documentNode);
		const descendant = documentNode.documentElement.firstChild.firstChild;
		// It is successful when the dom facade does not throw
		const nodes = evaluateXPathToNodes(
			'outermost(descendant::foo)',
			documentNode,
			buildDomFacade(descendant),
			null,
			{
				debug: true
			}
		);

		chai.assert.deepEqual((nodes as any) as slimdom.Node[], [
			documentNode.documentElement.firstChild
		]);
	});
});
