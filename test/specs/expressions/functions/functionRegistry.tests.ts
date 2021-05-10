import * as chai from 'chai';
import { SequenceMultiplicity, ValueType } from 'fontoxpath/expressions/dataTypes/Value';
import functionRegistry from 'fontoxpath/expressions/functions/functionRegistry';
import registerCustomXPathFunction from 'fontoxpath/registerCustomXPathFunction';

describe('functionRegistry.getFunctionByArity', () => {
	before(() => {
		registerCustomXPathFunction(
			'fonto:functionName',
			[],
			{ type: ValueType.XSBOOLEAN, mult: SequenceMultiplicity.EXACTLY_ONE },
			function () {}
		);

		registerCustomXPathFunction(
			'fonto:functionName',
			[{ type: ValueType.XSBOOLEAN, mult: SequenceMultiplicity.EXACTLY_ONE }],
			{ type: ValueType.XSBOOLEAN, mult: SequenceMultiplicity.EXACTLY_ONE },
			function () {}
		);

		registerCustomXPathFunction(
			'fonto:otherFunctionName',
			[],
			{ type: ValueType.XSBOOLEAN, mult: SequenceMultiplicity.EXACTLY_ONE },
			function () {}
		);
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
