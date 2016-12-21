import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import evaluateXPathToMap from 'fontoxml-selectors/evaluateXPathToMap';
import parseSelector from 'fontoxml-selectors/parsing/createSelectorFromXPath';
import jsonMLMapper from 'fontoxml-dom-utils/jsonMLMapper';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('map constructor', () => {
	beforeEach(() => {
		jsonMLMapper.parse([
			'someElement',
			{ someAttribute: 'someValue' },
			'A piece of text'
		], documentNode);
	});

	it(
		'can be parsed',
		() => chai.assert.isOk(parseSelector('map {"a": 1, "b":2}')), 'It should be able to be parsed');

	it(
		'creates a map which can be returned by evaluateXPathToMap',
		() => chai.assert.deepEqual(evaluateXPathToMap('map {"a": 1, "b":2}', documentNode, blueprint), { a: 1, b: 2 }));

	it(
		'can use attribute nodes as keys',
		() => chai.assert.deepEqual(evaluateXPathToMap('map {@someAttribute: 1}', documentNode.documentElement, blueprint), { someValue: 1 }));

	it(
		'can use nodes as keys',
		() => chai.assert.deepEqual(evaluateXPathToMap('map {*: 1}', documentNode, blueprint), { 'A piece of text': 1 }));

	it(
		'is parsed using longest substring (map{x:a:b} is map{{(x:a):b})',
		() =>
			chai.assert.deepEqual(
				evaluateXPathToMap(
					'map {x:a:b}',
					jsonMLMapper.parseNode(documentNode, [
						'someElement',
						{
							'xmlns:x': 'xxx',
							'xmlns:a': 'aaa'
						},
						['x:a', 'a'],
						['a:b', 'a:b'],
						['b', 'b']
					]), blueprint), { a: 'b' }));

	it(
		'throws an error when the key is not a singleton sequence',
		() => chai.assert.throws(() => evaluateXPathToMap('map {(1, 2): 3}', documentNode.documentElement, blueprint), 'XPTY0004'));
});
