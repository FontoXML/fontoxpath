import { ChildNodePointer, ParentNodePointer } from '../../domClone/Pointer';
import { NODE_TYPES } from '../../domFacade/ConcreteNode';
import createPointerValue from '../dataTypes/createPointerValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import Value from '../dataTypes/Value';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Expression, { RESULT_ORDERINGS } from '../Expression';
import TestAbstractExpression from '../tests/TestAbstractExpression';
import { Bucket, intersectBuckets } from '../util/Bucket';
import { DONE_TOKEN, ready } from '../util/iterators';
import validateContextNode from './validateContextNode';

class ChildAxis extends Expression {
	private readonly _childExpression: TestAbstractExpression;
	private readonly _filterBucket: Bucket;
	constructor(childExpression: TestAbstractExpression, filterBucket: Bucket) {
		super(childExpression.specificity, [childExpression], {
			resultOrder: RESULT_ORDERINGS.SORTED,
			subtree: true,
			peer: true,
			canBeStaticallyEvaluated: false,
		});

		this._childExpression = childExpression;
		this._filterBucket = intersectBuckets(filterBucket, childExpression.getBucket());
	}

	public evaluate(dynamicContext: DynamicContext, executionParameters: ExecutionParameters) {
		const domFacade = executionParameters.domFacade;
		const contextNode = validateContextNode(dynamicContext.contextItem);
		const nodeType = domFacade.getNodeType(contextNode);
		if (nodeType !== NODE_TYPES.ELEMENT_NODE && nodeType !== NODE_TYPES.DOCUMENT_NODE) {
			return sequenceFactory.empty();
		}

		let node: ChildNodePointer = null;
		let isDone = false;
		return sequenceFactory
			.create({
				next: () => {
					while (!isDone) {
						if (!node) {
							// Initial run
							node = domFacade.getFirstChildPointer(
								contextNode as ParentNodePointer,
								this._filterBucket,
							);
							if (!node) {
								isDone = true;
								continue;
							}
							return ready(createPointerValue(node, domFacade));
						}
						node = domFacade.getNextSiblingPointer(node, this._filterBucket);
						if (!node) {
							isDone = true;
							continue;
						}
						return ready(createPointerValue(node, domFacade));
					}
					return DONE_TOKEN;
				},
			})
			.filter((item) => {
				return this._childExpression.evaluateToBoolean(
					dynamicContext,
					item,
					executionParameters,
				);
			});
	}
}
export default ChildAxis;
