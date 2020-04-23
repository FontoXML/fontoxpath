import isSubtypeOf from '../dataTypes/isSubtypeOf';
import Specificity from '../Specificity';
import TestAbstractExpression from './TestAbstractExpression';
import Value from '../dataTypes/Value';
import ExecutionParameters from '../ExecutionParameters';
import DynamicContext from '../DynamicContext';

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

	public evaluateToBoolean(
		_dynamicContext: DynamicContext,
		node: Value,
		executionParameters: ExecutionParameters
	) {
		// Assume singleton
		const isMatchingProcessingInstruction =
			isSubtypeOf(node.type, 'processing-instruction()') &&
			executionParameters.domFacade.getTarget(node.value) === this._target;
		return isMatchingProcessingInstruction;
	}

	public getBucket() {
		return 'type-7';
	}
}

export default PITest;
