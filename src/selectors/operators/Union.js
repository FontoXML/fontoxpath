import Specificity from '../Specificity';
import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import { sortNodeValues } from '../dataTypes/documentOrderUtils';
import concatSequences from '../util/concatSequences';

/**
 * The 'union' expression: concats and sorts
 * @extends {Selector}
 */
class Union extends Selector {
	/**
	 * @param  {!Array<!Selector>}  expressions
	 */
	constructor (expressions) {
		const maxSpecificity = expressions.reduce((maxSpecificity, expression) => {
			if (maxSpecificity.compareTo(expression.specificity) > 0) {
				return maxSpecificity;
			}
			return expression.specificity;
		}, new Specificity({}));
		super(maxSpecificity, {
			canBeStaticallyEvaluated: expressions.every(expression => expression.canBeStaticallyEvaluated)
		});

	this._subSelectors = expressions;

	}

	evaluate (dynamicContext) {
		return concatSequences(
			this._subSelectors.map(
				expression => expression.evaluateMaybeStatically(dynamicContext)))
			.mapAll(allValues => {
				if (allValues.some(nodeValue => !isSubtypeOf(nodeValue.type, 'node()'))) {
					throw new Error('XPTY0004: The sequences to union are not of type node()*');
				}
				const sortedValues = sortNodeValues(dynamicContext.domFacade, allValues);
				return new Sequence(sortedValues);
			});
	}
}
export default Union;
