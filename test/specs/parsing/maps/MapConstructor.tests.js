import slimdom from 'slimdom';

import { domFacade, evaluateXPathToMap } from 'fontoxpath';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('map constructor', () => {
	beforeEach(() => {
		jsonMlMapper.parse([
			'someElement',
			{ someAttribute: 'someValue' },
			'A piece of text'
		], documentNode);
	});

	it(
		'can be parsed',
		() => chai.assert.isOk(evaluateXPathToMap('map {"a": 1, "b":2}', documentNode, domFacade)), 'It should be able to be parsed');

	it(
		'creates a map which can be returned by evaluateXPathToMap',
		() => chai.assert.deepEqual(evaluateXPathToMap('map {"a": 1, "b":2}', documentNode, domFacade), { a: 1, b: 2 }));

	it(
		'can use attribute nodes as keys',
		() => chai.assert.deepEqual(evaluateXPathToMap('map {@someAttribute: 1}', documentNode.documentElement, domFacade), { someValue: 1 }));

	it(
		'can use nodes as keys',
		() => chai.assert.deepEqual(evaluateXPathToMap('map {*: 1}', documentNode, domFacade), { 'A piece of text': 1 }));

	it(
		'is parsed using longest substring (map{x:a:b} is map{{(x:a):b})',
		() =>
			chai.assert.deepEqual(
				evaluateXPathToMap(
					'map {x:a:b}',
					jsonMlMapper.parseNode(documentNode, [
						'someElement',
						{
							'xmlns:x': 'xxx',
							'xmlns:a': 'aaa'
						},
						['x:a', 'a'],
						['a:b', 'a:b'],
						['b', 'b']
					]), domFacade), { a: 'b' }));

	it(
		'throws an error when the key is not a singleton sequence',
		() => chai.assert.throws(() => evaluateXPathToMap('map {(1, 2): 3}', documentNode.documentElement, domFacade), 'XPTY0004'));
});
