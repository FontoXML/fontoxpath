import TestAbstractExpression from './TestAbstractExpression';
import Specificity from '../Specificity';
import isSubtypeOf from '../dataTypes/isSubtypeOf';

class PITest extends TestAbstractExpression {
	/**
	 * @param  {string}  target
	 */
	constructor (target) {
		super({ canBeStaticallyEvaluated: false });

		this._target = target;

	}

	evaluateToBoolean (_dynamicContext, node) {
		// Assume singleton
		var isMatchingProcessingInstruction = isSubtypeOf(node.type, 'processing-instruction()') &&
			node.value.target === this._target;
		return isMatchingProcessingInstruction;
	}

	getBucket () {
		return 'type-7';
	}
}

export default PITest;
