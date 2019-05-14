import createNodeValue from '../dataTypes/createNodeValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import Expression, { RESULT_ORDERINGS } from '../Expression';
import TestAbstractExpression from '../tests/TestAbstractExpression';
import { DONE_TOKEN, ready } from '../util/iterators';

function generateAncestors(domFacade, contextNode, bucket) {
	let ancestor = contextNode;
	return {
		next: () => {
			if (!ancestor) {
				return DONE_TOKEN;
			}
			const previousAncestor = ancestor;
			ancestor = previousAncestor && domFacade.getParentNode(previousAncestor, bucket);

			return ready(createNodeValue(previousAncestor));
		}
	};
}

class AncestorAxis extends Expression {
	private _ancestorExpression: TestAbstractExpression;
	private _isInclusive: boolean;
	constructor(
		ancestorExpression: TestAbstractExpression,
		options: { inclusive: boolean } | undefined
	) {
		options = options || { inclusive: false };
		super(ancestorExpression.specificity, [ancestorExpression], {
			resultOrder: RESULT_ORDERINGS.REVERSE_SORTED,
			peer: false,
			subtree: false,
			canBeStaticallyEvaluated: false
		});

		this._ancestorExpression = ancestorExpression;
		this._isInclusive = !!options.inclusive;
	}

	public evaluate(dynamicContext, executionParameters) {
		const contextItem = dynamicContext.contextItem;
		if (contextItem === null) {
			throw new Error('XPDY0002: context is absent, it needs to be present to use axes.');
		}

		const domFacade = executionParameters.domFacade;

		const /** !Node */ contextNode = contextItem.value;
		return sequenceFactory
			.create(
				generateAncestors(
					domFacade,
					this._isInclusive ? contextNode : domFacade.getParentNode(contextNode, this._ancestorExpression.getBucket()),
					this._ancestorExpression.getBucket()
				)
			)
			.filter(item => {
				return this._ancestorExpression.evaluateToBoolean(dynamicContext, item);
			});
	}
}

export default AncestorAxis;
