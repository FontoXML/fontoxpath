import isSubtypeOf from '../dataTypes/isSubtypeOf';
import Value, { SequenceType } from '../dataTypes/Value';
import { BaseType } from '../dataTypes/BaseType';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
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

	public evaluateToBoolean(
		_dynamicContext: DynamicContext,
		node: Value,
		executionParameters: ExecutionParameters
	) {
		// Assume singleton
		const isMatchingProcessingInstruction =
			isSubtypeOf(node.type.kind, BaseType.PROCESSINGINSTRUCTION) &&
			executionParameters.domFacade.getTarget(node.value) === this._target;
		return isMatchingProcessingInstruction;
	}

	public getBucket() {
		return 'type-7';
	}
}

export default PITest;
