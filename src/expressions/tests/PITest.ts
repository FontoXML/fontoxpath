import isSubtypeOf from '../dataTypes/isSubtypeOf';
import Value, { ValueType } from '../dataTypes/Value';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import {} from '../Expression';
import Specificity from '../Specificity';
import { Bucket } from '../util/Bucket';
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

	public evaluateToBoolean(
		_dynamicContext: DynamicContext,
		node: Value,
		executionParameters: ExecutionParameters
	) {
		// Assume singleton
		const isMatchingProcessingInstruction =
			isSubtypeOf(node.type, ValueType.PROCESSINGINSTRUCTION) &&
			executionParameters.domFacade.getTarget(node.value) === this._target;
		return isMatchingProcessingInstruction;
	}

	public override getBucket(): Bucket {
		return 'type-7';
	}
}

export default PITest;
