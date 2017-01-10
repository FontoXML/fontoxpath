import registerCustomXPathFunction from 'fontoxpath/registerCustomXPathFunction';
import functionRegistry from 'fontoxpath/selectors/functions/functionRegistry';

describe('functionRegistry.getFunctionByArity', () => {
	before(() => {
		registerCustomXPathFunction(
			'fonto:functionName',
			[],
			'xs:boolean',
			function () {});

		registerCustomXPathFunction(
			'fonto:functionName',
			['xs:boolean'],
			'xs:boolean',
			function () {});

		registerCustomXPathFunction(
			'fonto:otherFunctionName',
			[],
			'xs:boolean',
			function () {});
	});

	it('return null if a custom function cannot be found', () => {
		chai.assert.isNull(functionRegistry.getFunctionByArity('fonto:bla', 0));
	});

	it('return null if a custom function with a given arity cannot be found', () => {
		chai.assert.isNull(functionRegistry.getFunctionByArity('fonto:functionName', 3));
	});

	it('return null if a built in function cannot be found', () => {
		chai.assert.isNull(functionRegistry.getFunctionByArity('bla', 3));
	});

	it('return null if a built in function with a given arity cannot be found', () => {
		chai.assert.isNull(functionRegistry.getFunctionByArity('true', 3));
	});
});
