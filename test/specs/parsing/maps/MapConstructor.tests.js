import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

import {
	evaluateXPathToMap
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('map constructor', () => {
	beforeEach(() => {
		jsonMlMapper.parse([
			'someElement',
			{ someAttribute: 'someValue' },
			'A piece of text'
		], documentNode);
	});

	it('can be parsed',
		() => chai.assert.isOk(evaluateXPathToMap('map {"a": 1, "b":2}', documentNode)), 'It should be able to be parsed');

	it('creates a map which can be returned by evaluateXPathToMap',
		() => chai.assert.deepEqual(evaluateXPathToMap('map {"a": 1, "b":2}', documentNode), { a: 1, b: 2 }));

	it('can use attribute nodes as keys',
		() => chai.assert.deepEqual(evaluateXPathToMap('map {@someAttribute: 1}', documentNode.documentElement), { someValue: 1 }));

	it('can use nodes as keys',
		() => chai.assert.deepEqual(evaluateXPathToMap('map {*: 1}', documentNode), { 'A piece of text': 1 }));

	it('is parsed using longest substring (map{x:a:b} is map{{(x:a):b})', () => {
		const element = documentNode.createElement('someElement');

		element.appendChild(documentNode.createElementNS('xxx', 'x:a')).appendChild(documentNode.createTextNode('a'));
		element.appendChild(documentNode.createElementNS('aaa', 'a:b')).appendChild(documentNode.createTextNode('a:b'));
;
		const expectedElement = element.appendChild(documentNode.createElementNS('', 'b'));
		expectedElement.appendChild(documentNode.createTextNode('b'));
		const namespacesByPrefix = {
			'a': 'aaa',
			'x': 'xxx',
			'': null
		};
		chai.assert.deepEqual(
			evaluateXPathToMap('map {x:a:b}', element, null, null, {
				namespaceResolver: (prefix) => namespacesByPrefix[prefix]
			}),
			{
				a: expectedElement
			});
	});

	it('throws an error when the key is not a singleton sequence',
		() => chai.assert.throws(() => evaluateXPathToMap('map {(1, 2): 3}', documentNode.documentElement), 'XPTY0004'));
});
