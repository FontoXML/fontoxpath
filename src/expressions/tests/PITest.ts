import isSubtypeOf from '../dataTypes/isSubtypeOf';
import Specificity from '../Specificity';
import TestAbstractExpression from './TestAbstractExpression';

class PITest extends TestAbstractExpression {
	private _target: string;

	constructor(target: string) {
		super(
			new Specificity({
				[Specificity.NODENAME_KIND]: 1,
			})
		);

		this._target = target;
	}

	public evaluateToBoolean(_dynamicContext, node) {
		// Assume singleton
		const isMatchingProcessingInstruction =
			isSubtypeOf(node.type, 'processing-instruction()') &&
			node.value.target === this._target;
		return isMatchingProcessingInstruction;
	}

	public getBucket() {
		return 'type-7';
	}
}

export default PITest;
