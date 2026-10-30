import * as chai from 'chai';
import * as slimdom from 'slimdom';

import AtomicValue from 'fontoxpath/expressions/dataTypes/AtomicValue';
import { Decimal } from 'fontoxpath/expressions/dataTypes/valueTypes/Decimal';
import { ValueType } from 'fontoxpath/expressions/dataTypes/Value';
import buildEvaluationContext from 'fontoxpath/evaluationUtils/buildEvaluationContext';

const evaluateToAtomicValue = (expression: string): AtomicValue => {
	const context = buildEvaluationContext(
		expression,
		new slimdom.Document(),
		null,
		{},
		{},
		{
			allowUpdating: false,
			allowXQuery: false,
			debug: false,
			disableCache: false,
			version: 3.1,
		},
	);
	return context.expression
		.evaluateMaybeStatically(context.dynamicContext, context.executionParameters)
		.first() as AtomicValue;
};

describe('xs:decimal invariant: a value typed xs:decimal holds a Decimal instance', () => {
	const decimalProducingExpressions = [
		'1.5',
		'-1.5',
		'1.1 + 2.2',
		'1.1 - 2.2',
		'1.1 * 2.2',
		'1 div 3',
		'1.5 + 2',
		'5.5 mod 2',
		'xs:decimal("1.5")',
		'xs:decimal(1.5)',
		'"1.5" cast as xs:decimal',
		'1.5 cast as xs:decimal',
	];

	decimalProducingExpressions.forEach((expression) => {
		it(`evaluates "${expression}" to an xs:decimal value that is a Decimal instance`, () => {
			const atomicValue = evaluateToAtomicValue(expression);
			chai.assert.strictEqual(
				atomicValue.type,
				ValueType.XSDECIMAL,
				'result is typed xs:decimal',
			);
			chai.assert.instanceOf(atomicValue.value, Decimal, 'value is a Decimal instance');
		});
	});
});
