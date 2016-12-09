import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import jsonMLMapper from 'fontoxml-dom-utils/jsonMLMapper';
import slimdom from 'slimdom';

import evaluateXPath from 'fontoxml-selectors/evaluateXPath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('Dynamic function call', () => {
	it('parses with a function with any number of arguments', () => {
		chai.assert.equal(
			evaluateXPath('let $fn := concat#3 return $fn("abc", "def", "ghi")', documentNode, blueprint, {}),
			'abcdefghi');
	});

	it('parses a function with a function to be executed as one of its arguments', () => {
		chai.assert.equal(
			evaluateXPath('let $fn := concat#2 return $fn(avg((10, 20)), max((2, 50)))', documentNode, blueprint, {}),
			'1550');
	});

	it('parses a function with a fixed number of arguments', () => {
		chai.assert.isFalse(evaluateXPath('let $fn := not#1 return $fn(true())', documentNode, blueprint, {}));
	});

	it('parses a function with a node lookup', () => {
		jsonMLMapper.parse([
				'someElement',
				{
					someAttribute1: 'someValue1',
					someAttribute2: 'someValue2',
					someAttribute3: 'someValue3'
				}
			], documentNode);

		chai.assert.equal(
			evaluateXPath('let $fn := string-join#2 return $fn(@node()/name(), ",")', documentNode.firstChild, blueprint, {}, evaluateXPath.STRING_TYPE),
			'someAttribute1,someAttribute2,someAttribute3');
	});

	it('parses a function with a no arguments', () => {
		chai.assert.isFalse(evaluateXPath('let $fn := false#0 return $fn()', documentNode, blueprint, {}));
	});

	it('throws when the base expression does not evaluate to a function', () => {
		chai.assert.throws(
			evaluateXPath.bind(undefined, 'let $notfn := 123 return $notfn("someArgument")', documentNode, blueprint, {}),
			'XPTY0004');
	});

	it('throws when the base expression evaluates to a non-singleton sequence of functions', () => {
		chai.assert.throws(
			evaluateXPath.bind(undefined, '(false#0, false#0)()', documentNode, blueprint, {}),
			'XPTY0004');
	});

	it('throws when a function is called with the wrong type of arguments', () => {
		chai.assert.throws(
			evaluateXPath.bind(undefined, 'let $fn := ends-with#2 return $fn(0, 0)', documentNode, blueprint, {}),
			'XPTY0004');
	});

	it('throws when a function is called with the wrong number of arguments', () => {
		chai.assert.throws(
			evaluateXPath.bind(undefined, 'let $fn := false#0 return $fn(1, 2)', documentNode, blueprint, {}),
			'XPTY0004');
	});

	it('throws when a function with the wrong arity cannot be found', () => {
		chai.assert.throws(
			evaluateXPath.bind(undefined, 'let $fn := false#2 return $fn(1, 2)', documentNode, blueprint, {}),
			'XPST0017');
	});
});
