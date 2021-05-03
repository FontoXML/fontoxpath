import { ChildNodePointer, NodePointer } from '../../domClone/Pointer';
import DomFacade from '../../domFacade/DomFacade';
import createPointerValue from '../dataTypes/createPointerValue';
import ISequence from '../dataTypes/ISequence';
import sequenceFactory from '../dataTypes/sequenceFactory';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Expression, { RESULT_ORDERINGS } from '../Expression';
import TestAbstractExpression from '../tests/TestAbstractExpression';
import { DONE_TOKEN, ready } from '../util/iterators';
import validateContextNode from './validateContextNode';

function createSiblingGenerator(domFacade: DomFacade, node: NodePointer, bucket: string | null) {
	return {
		next: () => {
			node = node && domFacade.getPreviousSiblingPointer(node as ChildNodePointer, bucket);
			if (!node) {
				return DONE_TOKEN;
			}

			return ready(createPointerValue(node, domFacade));
		},
	};
}

class PrecedingSiblingAxis extends Expression {
	private _siblingExpression: TestAbstractExpression;
	constructor(siblingExpression: TestAbstractExpression) {
		super(siblingExpression.specificity, [siblingExpression], {
			canBeStaticallyEvaluated: false,
			peer: true,
			resultOrder: RESULT_ORDERINGS.REVERSE_SORTED,
			subtree: false,
		});

		this._siblingExpression = siblingExpression;
	}

	public evaluate(
		dynamicContext: DynamicContext,
		executionParameters: ExecutionParameters
	): ISequence {
		const domFacade = executionParameters.domFacade;
		const contextPointer = validateContextNode(dynamicContext.contextItem);

		return sequenceFactory
			.create(
				createSiblingGenerator(
					domFacade,
					contextPointer,
					this._siblingExpression.getBucket()
				)
			)
			.filter((item) => {
				return this._siblingExpression.evaluateToBoolean(
					dynamicContext,
					item,
					executionParameters
				);
			});
	}
}

export default PrecedingSiblingAxis;
