import Expression, { RESULT_ORDERINGS } from '../Expression';

import sequenceFactory from '../dataTypes/sequenceFactory';
import TestAbstractExpression from '../tests/TestAbstractExpression';

class SelfAxis extends Expression {
	private _selector: TestAbstractExpression;
	constructor(selector: TestAbstractExpression) {
		super(selector.specificity, [selector], {
			resultOrder: RESULT_ORDERINGS.SORTED,
			subtree: true,
			peer: true,
			canBeStaticallyEvaluated: false,
		});

		this._selector = selector;
	}

	public evaluate(dynamicContext, executionParameters) {
		if (dynamicContext.contextItem === null) {
			throw new Error('XPDY0002: context is absent, it needs to be present to use axes.');
		}

		const isMatch = this._selector.evaluateToBoolean(
			dynamicContext,
			dynamicContext.contextItem,
			executionParameters
		);
		return isMatch
			? sequenceFactory.singleton(dynamicContext.contextItem)
			: sequenceFactory.empty();
	}

	public getBucket() {
		return this._selector.getBucket();
	}
}
export default SelfAxis;
