import Specificity from '../Specificity';
import Expression from '../Expression';
import Sequence from '../dataTypes/Sequence';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import { sortNodeValues } from '../dataTypes/documentOrderUtils';
import concatSequences from '../util/concatSequences';

/**
 * The 'union' expression: concats and sorts
 * @extends {Expression}
 */
class Union extends Expression {
	/**
	 * @param  {!Array<!Expression>}  expressions
	 */
	constructor (expressions) {
		const maxSpecificity = expressions.reduce((maxSpecificity, expression) => {
			if (maxSpecificity.compareTo(expression.specificity) > 0) {
				return maxSpecificity;
			}
			return expression.specificity;
		}, new Specificity({}));
		super(
			maxSpecificity,
			expressions,
			{
				canBeStaticallyEvaluated: expressions.every(expression => expression.canBeStaticallyEvaluated)
			});

	this._subExpressions = expressions;

	}

	evaluate (dynamicContext, executionParameters) {
		return concatSequences(
			this._subExpressions.map(
				expression => expression.evaluateMaybeStatically(dynamicContext, executionParameters)))
			.mapAll(allValues => {
				if (allValues.some(nodeValue => !isSubtypeOf(nodeValue.type, 'node()'))) {
					throw new Error('XPTY0004: The sequences to union are not of type node()*');
				}
				const sortedValues = sortNodeValues(executionParameters.domFacade, allValues);
				return new Sequence(sortedValues);
			});
	}
}
export default Union;
