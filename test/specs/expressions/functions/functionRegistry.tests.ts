import * as chai from 'chai';
import { SequenceMultiplicity, ValueType } from 'fontoxpath/expressions/dataTypes/Value';
import functionRegistry from 'fontoxpath/expressions/functions/functionRegistry';
import registerCustomXPathFunction from 'fontoxpath/registerCustomXPathFunction';

describe('functionRegistry.getFunctionByArity', () => {
	before(() => {
		registerCustomXPathFunction(
			'fontoxpath_test_prefix:functionName',
			[],
			'xs:boolean',
			function () {}
		);

		registerCustomXPathFunction(
			'fontoxpath_test_prefix:functionName',
			['xs:boolean'],
			'xs:boolean',
			function () {}
		);

		registerCustomXPathFunction(
			'fontoxpath_test_prefix:otherFunctionName',
			[],
			'xs:boolean',
			function () {}
		);
	});

	it('return null if a custom function cannot be found', () => {
		chai.assert.isNull(
			functionRegistry.getFunctionByArity(
				'fontoxpath_test_prefix:bla',
				'functionLocalName',
				0
			)
		);
	});

	it('return null if a custom function with a given arity cannot be found', () => {
		chai.assert.isNull(
			functionRegistry.getFunctionByArity(
				'fontoxpath_test_prefix:functionName',
				'functionLocalName',
				3
			)
		);
	});

	it('return null if a built in function cannot be found', () => {
		chai.assert.isNull(functionRegistry.getFunctionByArity('bla', 'functionLocalName', 3));
	});

	it('return null if a built in function with a given arity cannot be found', () => {
		chai.assert.isNull(functionRegistry.getFunctionByArity('true', 'functionLocalName', 3));
	});
});
