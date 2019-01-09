import * as chai from 'chai';
import * as slimdom from 'slimdom';

import {
	evaluateUpdatingExpression,
	executePendingUpdateList
} from 'fontoxpath';
import assertUpdateList from './assertUpdateList';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('ReplaceExpression', () => {
	it('can replace a node and generate the correct update list', async () => {
		const ele = documentNode.appendChild(documentNode.createElement('ele'));
		const result = await evaluateUpdatingExpression('replace node ele with <ele/>', documentNode, null, {}, {});

		chai.assert.deepEqual(result.xdmValue, []);
		assertUpdateList(result.pendingUpdateList, [
			{
				type: 'replaceNode',
				target: ele,
				replacementXML: ['<ele/>']
			}
		]);
	});

	it('can replace an attribute node and generate the correct update list', async () => {
		const ele = documentNode.appendChild(documentNode.createElement('ele'));
		ele.setAttribute('attr', 'value1');
		const result = await evaluateUpdatingExpression('replace node ele/@attr with <ele attrReplace="value" />/@value', documentNode, null, {}, {});

		chai.assert.deepEqual(result.xdmValue, []);
		assertUpdateList(result.pendingUpdateList, [
			{
				type: 'replaceNode',
				target: ele.getAttributeNode('attr'),
				replacementXML: ['attrReplace="value"']
			}
		]);
	});

	it('can replace the value of an attribute node with a PI', async () => {
		const ele = documentNode.appendChild(documentNode.createElement('ele'));
		ele.setAttribute('attr', 'value1');
		const result = await evaluateUpdatingExpression('replace value of node ele/@attr with <?processing instruction?>', documentNode, null, {}, {});

		chai.assert.deepEqual(result.xdmValue, []);
		assertUpdateList(result.pendingUpdateList, [
			{
				type: 'replaceValue',
				target: ele.getAttributeNode('attr'),
				stringValue: 'instruction'
			}
		]);
	});

	it('can have a replace expression in a conditional expression', async () => {
		const ele = documentNode.appendChild(documentNode.createElement('ele'));
		const result = await evaluateUpdatingExpression('if (true()) then replace node ele with <ele/> else ()', documentNode, null, {}, {});

		chai.assert.deepEqual(result.xdmValue, []);
		assertUpdateList(result.pendingUpdateList, [
			{
				type: 'replaceNode',
				target: ele,
				replacementXML: ['<ele/>']
			}
		]);
	});

	it('disallows executing non-updating expressions', async () => {
		let error;
		try {
			await evaluateUpdatingExpression('()', documentNode, null, {}, {});
		} catch (err) {
			error = err;
		}

		chai.assert.throws(
			() => {
				if (error) {
					throw error;
				} else {
					return null;
				}
			},
			'is not updating and can not be executed as an updating expression.');
	});

	it('disallows replacing the empty sequence', async () => {
		let error;
		try {
			await evaluateUpdatingExpression('replace node () with <ele />', documentNode, null, {}, {});
		} catch (err) {
			error = err;
		}

		chai.assert.throws(
			() => {
				if (error) {
					throw error;
				} else {
					return null;
				}
			},
			'XUDY0027');
	});

	it('disallows replacing elements with attributes', async () => {
		documentNode.appendChild(documentNode.createElement('element'));
		let error;
		try {
			await evaluateUpdatingExpression('replace node /element with <ele attr="value"/>/@attr', documentNode, null, {}, {});
		} catch (err) {
			error = err;
		}

		chai.assert.throws(
			() => {
				if (error) {
					throw error;
				} else {
					return null;
				}
			},
			'XUTY0010');
	});

	it('disallows replacing attributes with elements', async () => {
		documentNode.appendChild(documentNode.createElement('element')).setAttribute('attr', 'value');

		let error;
		try {
			await evaluateUpdatingExpression('replace node /element/@attr with <ele/>', documentNode, null, {}, {});
		} catch (err) {
			error = err;
		}

		chai.assert.throws(
			() => {
				if (error) {
					throw error;
				} else {
					return null;
				}
			},
			'XUTY0011');
	});

	it('disallows an attribute with multiple attributes with the same prefix but different namespaces', async () => {
		documentNode.appendChild(documentNode.createElement('element')).setAttribute('attr', '1234');

		let error;
		try {
			await evaluateUpdatingExpression(
				'replace node /element/@attr with (<ele xmlns:xxx="YYY" xxx:attr="123"/>, <ele xmlns:xxx="ZZZ" xxx:attr="123"/>)/@*',
				documentNode,
				null,
				{},
				{});
		} catch (err) {
			error = err;
		}

		chai.assert.throws(
			() => {
				if (error) {
					throw error;
				} else {
					return null;
				}
			},
			'XUDY0024');
	});

	it('disallows attributes with attributes with the same prefix but different namespaces', async () => {
		const element = documentNode.appendChild(documentNode.createElement('element'));
		element.setAttribute('attr1', '1234');
		element.setAttribute('attr2', '5678');

		let error;
		try {
			const result = await evaluateUpdatingExpression(
				`replace node /element/@attr1 with <ele xmlns:xxx="YYY" xxx:attr="123"/>/@*,
				replace node /element/@attr2 with <ele xmlns:xxx="ZZZ" xxx:attr="123"/>/@*`,
				documentNode,
				null,
				{},
				{});
			executePendingUpdateList(result.pendingUpdateList, null, null, null);
		} catch (err) {
			error = err;
		}

		chai.assert.throws(
			() => {
				if (error) {
					throw error;
				} else {
					return null;
				}
			},
			'XUDY0024');
	});

	it('disallows replacing multiple nodes at once', async () => {
		let error;
		try {
			await evaluateUpdatingExpression('replace node (/, /) with <ele />', documentNode, null, {}, {});
		} catch (err) {
			error = err;
		}

		chai.assert.throws(
			() => {
				if (error) {
					throw error;
				} else {
					return null;
				}
			},
			'XUTY0008');
	});

	it('disallows replacing the document node', async () => {
		let error;
		try {
			await evaluateUpdatingExpression('replace node . with <ele></ele>', documentNode, null, {}, {});
		} catch (err) {
			error = err;
		}

		chai.assert.throws(
			() => {
				if (error) {
					throw error;
				} else {
					return null;
				}
			},
			'XUTY0008');
	});

	it('disallows replacing the value of a document node', async () => {
		let error;
		try {
			await evaluateUpdatingExpression('replace value of node . with <ele></ele>', documentNode, null, {}, {});
		} catch (err) {
			error = err;
		}

		chai.assert.throws(
			() => {
				if (error) {
					throw error;
				} else {
					return null;
				}
			},
			'XUTY0008');
	});


	it('disallows replacing detached nodes', async () => {
		let error;
		try {
			await evaluateUpdatingExpression('replace node <ele /> with <ele />', documentNode, null, {}, {});
		} catch (err) {
			error = err;
		}

		chai.assert.throws(
			() => {
				if (error) {
					throw error;
				} else {
					return null;
				}
			},
			'XUDY0009');
	});


	it('disallows replacing the value of the empty sequence', async () => {
		let error;
		try {
			await evaluateUpdatingExpression('replace value of node () with <ele />', documentNode, null, {}, {});
		} catch (err) {
			error = err;
		}

		chai.assert.throws(
			() => {
				if (error) {
					throw error;
				} else {
					return null;
				}
			},
			'XUDY0027');
	});

	it('disallows replacing the value of multiple nodes at once', async () => {
		let error;
		try {
			await evaluateUpdatingExpression('replace value of node (/, /) with <ele />', documentNode, null, {}, {});
		} catch (err) {
			error = err;
		}

		chai.assert.throws(
			() => {
				if (error) {
					throw error;
				} else {
					return null;
				}
			},
			'XUTY0008');
	});

	it('disallows replacing the value of multiple nodes at once', async () => {
		let error;
		try {
			await evaluateUpdatingExpression('replace value of node (/, /) with <ele />', documentNode, null, {}, {});
		} catch (err) {
			error = err;
		}

		chai.assert.throws(
			() => {
				if (error) {
					throw error;
				} else {
					return null;
				}
			},
			'XUTY0008');
	});

	it('allows nested replaces', async () => {
		const list = documentNode.appendChild(documentNode.createElement('list'));
		list.setAttribute('count', '3');
		const listItem1 = list.appendChild(documentNode.createElement('list-item'));
		listItem1.setAttribute('i', '1');
		const listItem2 = list.appendChild(documentNode.createElement('list-item'));
		listItem2.setAttribute('i', '2');
		const listItem3 = list.appendChild(documentNode.createElement('list-item'));
		listItem3.setAttribute('i', '3');

		// Duplicate all list items and set the @count attribute to the new count of items, in a very roundabout way
		const result = await evaluateUpdatingExpression(
			'replace value of node list/@count with sum(for $list-item in list/* return (replace node $list-item with ($list-item, $list-item), 2))',
			documentNode,
			null,
			{},
			{});

		chai.assert.deepEqual(result.xdmValue, []);
		assertUpdateList(result.pendingUpdateList, [
			{
				type: 'replaceValue',
				target: list.getAttributeNode('count'),
				stringValue: '6'
			},
			{
				type: 'replaceNode',
				target: listItem1,
				replacementXML: ['<list-item i="1"/>', '<list-item i="1"/>']
			},
			{
				type: 'replaceNode',
				target: listItem2,
				replacementXML: ['<list-item i="2"/>', '<list-item i="2"/>']
			},
			{
				type: 'replaceNode',
				target: listItem3,
				replacementXML: ['<list-item i="3"/>', '<list-item i="3"/>']
			}
		]);
	});

	it('allows replacing the value of something with something asynchronous', async () => {
		const element = documentNode.appendChild(documentNode.createElement('element'));

		// Duplicate all list items and set the @count attribute to the new count of items, in a very roundabout way
		const result = await evaluateUpdatingExpression(
			`
declare namespace fontoxpath="http://fontoxml.com/fontoxpath";

replace value of node fontoxpath:sleep(/element, 100) with fontoxpath:sleep("100", 1)
`,
			documentNode,
			null,
			{},
			{});

		chai.assert.deepEqual(result.xdmValue, []);
		assertUpdateList(result.pendingUpdateList, [
			{
				type: 'replaceElementContent',
				target: element,
				text: '100'
			}
		]);
	});

	it('allows replacing something with something asynchronous', async () => {
		const element = documentNode.appendChild(documentNode.createElement('element'));

		// Duplicate all list items and set the @count attribute to the new count of items, in a very roundabout way
		const result = await evaluateUpdatingExpression(
			`
declare namespace fontoxpath="http://fontoxml.com/fontoxpath";

replace node fontoxpath:sleep(/element, 100) with fontoxpath:sleep(<newElement/>, 1)
`,
			documentNode,
			null,
			{},
			{});

		chai.assert.deepEqual(result.xdmValue, []);
		assertUpdateList(result.pendingUpdateList, [
			{
				type: 'replaceNode',
				target: element,
				replacementXML: ['<newElement/>']
			}
		]);
	});

	it('allows replacing something with a whole document', async () => {
		const element = documentNode.appendChild(documentNode.createElement('element'));

		// Duplicate all list items and set the @count attribute to the new count of items, in a very roundabout way
		const result = await evaluateUpdatingExpression(
			`
declare namespace fontoxpath="http://fontoxml.com/fontoxpath";

replace node /element with /
`,
			documentNode,
			null,
			{},
			{});

		chai.assert.deepEqual(result.xdmValue, []);
		assertUpdateList(result.pendingUpdateList, [
			{
				type: 'replaceNode',
				target: element,
				replacementXML: ['<element/>', '<!--comment-->']
			}
		]);
	});
});
