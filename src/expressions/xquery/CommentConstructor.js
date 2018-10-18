import Expression from '../Expression';
import Specificity from '../Specificity';

import castToType from '../dataTypes/castToType';
import createNodeValue from '../dataTypes/createNodeValue';
import Sequence from '../dataTypes/Sequence';

/**
 * @extends {Expression}
 */
class CommentConstructor extends Expression {
	/**
	 * @param  {?Expression} expr
	 */
	constructor (expr) {
		super(
			expr ? expr.specificity : new Specificity({}),
			expr ? [expr] : [],
			{
				canBeStaticallyEvaluated: false,
				resultOrder: Expression.RESULT_ORDERINGS.UNSORTED
			});

		this._expr = expr;
	}

	evaluate (_dynamicContext, executionParameters) {
		const nodesFactory = executionParameters.nodesFactory;
		if (!this._expr) {
			return Sequence.singleton(createNodeValue(nodesFactory.createComment('')));
		}
		const sequence = this._expr.evaluateMaybeStatically(_dynamicContext, executionParameters);
		return sequence
			.atomize(executionParameters)
			.mapAll(items =>
				Sequence.singleton(
					createNodeValue(nodesFactory.createComment(items.map(item => castToType(item, 'xs:string').value).join(' ')))));
	}
}

export default CommentConstructor;
