import Expression, { RESULT_ORDERINGS } from '../Expression';
import Specificity from '../Specificity';

import castToType from '../dataTypes/castToType';
import createNodeValue from '../dataTypes/createNodeValue';
import SequenceFactory from '../dataTypes/SequenceFactory';

class CommentConstructor extends Expression {
	_expr: Expression;
	constructor(expr: Expression | null) {
		super(expr ? expr.specificity : new Specificity({}), expr ? [expr] : [], {
			canBeStaticallyEvaluated: false,
			resultOrder: RESULT_ORDERINGS.UNSORTED
		});

		this._expr = expr;
	}

	evaluate(_dynamicContext, executionParameters) {
		const nodesFactory = executionParameters.nodesFactory;
		if (!this._expr) {
			return SequenceFactory.singleton(createNodeValue(nodesFactory.createComment('')));
		}
		const sequence = this._expr.evaluateMaybeStatically(_dynamicContext, executionParameters);
		return sequence.atomize(executionParameters).mapAll(items => {
			const content = items.map(item => castToType(item, 'xs:string').value).join(' ');

			if (content.indexOf('-->') !== -1) {
				throw new Error(
					'XQDY0072: The contents of the data of a comment may not include "-->"'
				);
			}

			return SequenceFactory.singleton(createNodeValue(nodesFactory.createComment(content)));
		});
	}
}

export default CommentConstructor;
