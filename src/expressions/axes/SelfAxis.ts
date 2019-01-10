import Expression, { RESULT_ORDERINGS } from '../Expression';

import SequenceFactory from '../dataTypes/SequenceFactory';
import TestAbstractExpression from '../tests/TestAbstractExpression';

class SelfAxis extends Expression {
	_selector: TestAbstractExpression;
	constructor(selector: TestAbstractExpression) {
		super(selector.specificity, [selector], {
			resultOrder: RESULT_ORDERINGS.SORTED,
			subtree: true,
			peer: true,
			canBeStaticallyEvaluated: false
		});

		this._selector = selector;
	}

	evaluate(dynamicContext, _executionParameters) {
		if (dynamicContext.contextItem === null) {
			throw new Error('XPDY0002: context is absent, it needs to be present to use axes.');
		}

		const isMatch = this._selector.evaluateToBoolean(
			dynamicContext,
			dynamicContext.contextItem
		);
		return isMatch
			? SequenceFactory.singleton(dynamicContext.contextItem)
			: SequenceFactory.empty();
	}

	getBucket() {
		return this._selector.getBucket();
	}
}
export default SelfAxis;
