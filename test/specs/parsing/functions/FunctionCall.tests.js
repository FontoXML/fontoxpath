import { domFacade } from 'fontoxpath';
import jsonMlMapper from 'test-helpers/jsonMlMapper';
import slimdom from 'slimdom';

import { evaluateXPathToString } from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('Dynamic function call', () => {
	it('parses with a function with any number of arguments', () => {
		chai.assert.equal(
			evaluateXPathToString('let $fn := concat#3 return $fn("abc", "def", "ghi")', documentNode, domFacade, {}),
			'abcdefghi');
	});

	it('parses a function with a function to be executed as one of its arguments', () => {
		chai.assert.equal(
			evaluateXPathToString('let $fn := concat#2 return $fn(avg((10, 20)), max((2, 50)))', documentNode, domFacade, {}),
			'1550');
	});

	it('parses a function with a fixed number of arguments', () => {
		chai.assert.isFalse(evaluateXPathToString('let $fn := not#1 return $fn(true())', documentNode, domFacade, {}));
	});

	it('parses a function with a node lookup', () => {
		jsonMlMapper.parse([
				'someElement',
				{
					someAttribute1: 'someValue1',
					someAttribute2: 'someValue2',
					someAttribute3: 'someValue3'
				}
			], documentNode);

		chai.assert.equal(
			evaluateXPathToString('let $fn := string-join#2 return $fn(@node()/name(), ",")', documentNode.firstChild, domFacade),
			'someAttribute1,someAttribute2,someAttribute3');
	});

	it('parses a function with a no arguments', () => {
		chai.assert.isFalse(evaluateXPathToString('let $fn := false#0 return $fn()', documentNode, domFacade, {}));
	});

	it('throws when the base expression does not evaluate to a function', () => {
		chai.assert.throws(
			() => evaluateXPathToString('let $notfn := 123 return $notfn("someArgument")', documentNode, domFacade, {}),
			'XPTY0004');
	});

	it('throws when the base expression evaluates to a non-singleton sequence of functions', () => {
		chai.assert.throws(
			() => evaluateXPathToString('(false#0, false#0)()', documentNode, domFacade, {}),
			'XPTY0004');
	});

	it('throws when a function is called with the wrong type of arguments', () => {
		chai.assert.throws(
			() => evaluateXPathToString('let $fn := ends-with#2 return $fn(0, 0)', documentNode, domFacade, {}),
			'XPTY0004');
	});

	it('throws when a function is called with the wrong number of arguments', () => {
		chai.assert.throws(
			() => evaluateXPathToString('let $fn := false#0 return $fn(1, 2)', documentNode, domFacade, {}),
			'XPTY0004');
	});

	it('throws when a function with the wrong arity cannot be found', () => {
		chai.assert.throws(
			() => evaluateXPathToString('let $fn := false#2 return $fn(1, 2)', documentNode, domFacade, {}),
			'XPST0017');
	});
});
