import atomize from '../dataTypes/atomize';
import castToType from '../dataTypes/castToType';
import createNodeValue from '../dataTypes/createNodeValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import Expression, { RESULT_ORDERINGS } from '../Expression';
import Specificity from '../Specificity';

class CommentConstructor extends Expression {
	private _expr: Expression;
	constructor(expr: Expression | null) {
		super(expr ? expr.specificity : new Specificity({}), expr ? [expr] : [], {
			canBeStaticallyEvaluated: false,
			resultOrder: RESULT_ORDERINGS.UNSORTED,
		});

		this._expr = expr;
	}

	public evaluate(_dynamicContext, executionParameters) {
		const nodesFactory = executionParameters.nodesFactory;
		if (!this._expr) {
			return sequenceFactory.singleton(createNodeValue(nodesFactory.createComment('')));
		}
		const sequence = this._expr.evaluateMaybeStatically(_dynamicContext, executionParameters);
		return atomize(sequence, executionParameters).mapAll((items) => {
			const content = items.map((item) => castToType(item, 'xs:string').value).join(' ');

			if (content.indexOf('-->') !== -1) {
				throw new Error(
					'XQDY0072: The contents of the data of a comment may not include "-->"'
				);
			}

			return sequenceFactory.singleton(createNodeValue(nodesFactory.createComment(content)));
		});
	}
}

export default CommentConstructor;
