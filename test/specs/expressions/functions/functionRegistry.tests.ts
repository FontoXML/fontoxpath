import * as chai from 'chai';
import functionRegistry from 'fontoxpath/expressions/functions/functionRegistry';
import registerCustomXPathFunction from 'fontoxpath/registerCustomXPathFunction';

describe('functionRegistry.getFunctionByArity', () => {
	before(() => {
		registerCustomXPathFunction('fonto:functionName', [], 'xs:boolean', function () {});

		registerCustomXPathFunction(
			'fonto:functionName',
			['xs:boolean'],
			'xs:boolean',
			function () {}
		);

		registerCustomXPathFunction('fonto:otherFunctionName', [], 'xs:boolean', function () {});
	});

	it('return null if a custom function cannot be found', () => {
		chai.assert.isNull(
			functionRegistry.getFunctionByArity('fonto:bla', 'functionLocalName', 0)
		);
	});

	it('return null if a custom function with a given arity cannot be found', () => {
		chai.assert.isNull(
			functionRegistry.getFunctionByArity('fonto:functionName', 'functionLocalName', 3)
		);
	});

	it('return null if a built in function cannot be found', () => {
		chai.assert.isNull(functionRegistry.getFunctionByArity('bla', 'functionLocalName', 3));
	});

	it('return null if a built in function with a given arity cannot be found', () => {
		chai.assert.isNull(functionRegistry.getFunctionByArity('true', 'functionLocalName', 3));
	});
});
