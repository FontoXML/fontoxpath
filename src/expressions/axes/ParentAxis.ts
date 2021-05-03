import { ChildNodePointer } from '../../domClone/Pointer';
import createPointerValue from '../dataTypes/createPointerValue';
import ISequence from '../dataTypes/ISequence';
import sequenceFactory from '../dataTypes/sequenceFactory';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Expression, { RESULT_ORDERINGS } from '../Expression';
import TestAbstractExpression from '../tests/TestAbstractExpression';
import validateContextNode from './validateContextNode';

class ParentAxis extends Expression {
	private _parentExpression: TestAbstractExpression;
	constructor(parentExpression: TestAbstractExpression) {
		super(parentExpression.specificity, [parentExpression], {
			resultOrder: RESULT_ORDERINGS.REVERSE_SORTED,
			peer: true,
			subtree: true,
			canBeStaticallyEvaluated: false,
		});

		this._parentExpression = parentExpression;
	}

	public evaluate(
		dynamicContext: DynamicContext,
		executionParameters: ExecutionParameters
	): ISequence {
		const domFacade = executionParameters.domFacade;
		const contextPointer = validateContextNode(dynamicContext.contextItem);

		const parentNode = domFacade.getParentNodePointer(
			contextPointer as ChildNodePointer,
			this._parentExpression.getBucket()
		);
		if (!parentNode) {
			return sequenceFactory.empty();
		}
		const parentNodeValue = createPointerValue(parentNode, executionParameters.domFacade);
		const nodeIsMatch = this._parentExpression.evaluateToBoolean(
			dynamicContext,
			parentNodeValue,
			executionParameters
		);
		if (!nodeIsMatch) {
			return sequenceFactory.empty();
		}
		return sequenceFactory.singleton(parentNodeValue);
	}
}

export default ParentAxis;
