import { sortNodeValues } from '../dataTypes/documentOrderUtils';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { BaseType, SequenceType, ValueType } from '../dataTypes/Value';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Expression, { RESULT_ORDERINGS } from '../Expression';
import Specificity from '../Specificity';
import concatSequences from '../util/concatSequences';
import { DONE_TOKEN, ready } from '../util/iterators';
import { mergeSortedSequences } from '../util/sortedSequenceUtils';

/**
 * The 'union' expression: concats and sorts nodes
 */
class Union extends Expression {
	private _subExpressions: Expression[];

	constructor(expressions: Expression[]) {
		const maxSpecificity = expressions.reduce((maxSpecificitySoFar, expression) => {
			if (maxSpecificitySoFar.compareTo(expression.specificity) > 0) {
				return maxSpecificitySoFar;
			}
			return expression.specificity;
		}, new Specificity({}));
		super(maxSpecificity, expressions, {
			canBeStaticallyEvaluated: expressions.every(
				(expression) => expression.canBeStaticallyEvaluated
			),
		});

		this._subExpressions = expressions;
	}

	public evaluate(dynamicContext: DynamicContext, executionParameters: ExecutionParameters) {
		if (
			this._subExpressions.every(
				(subExpression) => subExpression.expectedResultOrder === RESULT_ORDERINGS.SORTED
			)
		) {
			let i = 0;
			// Every sequence is locally sorted: we can merge them. This saves a lot of unneeded
			// sorting for sequences that are already naturally sorted.
			return mergeSortedSequences(executionParameters.domFacade, {
				next: (_hint) => {
					if (i >= this._subExpressions.length) {
						return DONE_TOKEN;
					}
					return ready(
						this._subExpressions[i++].evaluateMaybeStatically(
							dynamicContext,
							executionParameters
						)
					);
				},
			}).map((value) => {
				if (!isSubtypeOf(value.type.kind, BaseType.NODE)) {
					throw new Error('XPTY0004: The sequences to union are not of type node()*');
				}
				return value;
			});
		}
		return concatSequences(
			this._subExpressions.map((expression) =>
				expression.evaluateMaybeStatically(dynamicContext, executionParameters)
			)
		).mapAll((allValues) => {
			if (allValues.some((nodeValue) => !isSubtypeOf(nodeValue.type.kind, BaseType.NODE))) {
				throw new Error('XPTY0004: The sequences to union are not of type node()*');
			}

			const sortedValues = sortNodeValues(executionParameters.domFacade, allValues);
			return sequenceFactory.create(sortedValues);
		});
	}
}
export default Union;
