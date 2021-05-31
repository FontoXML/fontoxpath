import sequenceFactory from '../dataTypes/sequenceFactory';
import { SequenceType } from '../dataTypes/Value';
import Expression, { RESULT_ORDERINGS } from '../Expression';
import Specificity from '../Specificity';

class ContextItemExpression extends Expression {
	constructor(type: SequenceType) {
		super(
			new Specificity({}),
			[],
			{
				resultOrder: RESULT_ORDERINGS.SORTED,
			},
			false,
			type
		);
	}

	public evaluate(dynamicContext, _executionParameters) {
		if (dynamicContext.contextItem === null) {
			throw new Error(
				'XPDY0002: context is absent, it needs to be present to use the "." operator'
			);
		}
		return sequenceFactory.singleton(dynamicContext.contextItem);
	}
}
export default ContextItemExpression;
