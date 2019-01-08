import Expression from '../Expression';
import SequenceFactory from '../dataTypes/SequenceFactory';
import createNodeValue from '../dataTypes/createNodeValue';
import { DONE_TOKEN, ready } from '../util/iterators';
import TestAbstractExpression from '../tests/TestAbstractExpression';

function generateAncestors (domFacade, contextNode) {
	let ancestor = contextNode;
	return {
		next: () => {
			if (!ancestor) {
				return DONE_TOKEN;
			}
			const previousAncestor = ancestor;
			ancestor = previousAncestor && domFacade.getParentNode(previousAncestor);

			return ready(createNodeValue(previousAncestor));
		}
	};
}

class AncestorAxis extends Expression {
	_ancestorExpression: TestAbstractExpression;
	_isInclusive: boolean;
	constructor(ancestorExpression: TestAbstractExpression, options: { inclusive: boolean; } | undefined) {
		options = options || { inclusive: false };
		super(
			ancestorExpression.specificity,
			[ancestorExpression],
			{
				resultOrder: Expression.RESULT_ORDERINGS.REVERSE_SORTED,
				peer: false,
				subtree: false,
				canBeStaticallyEvaluated: false
			});

		this._ancestorExpression = ancestorExpression;
		this._isInclusive = !!options.inclusive;
	}

	evaluate (dynamicContext, executionParameters) {
		const contextItem = dynamicContext.contextItem;
		if (contextItem === null) {
			throw new Error('XPDY0002: context is absent, it needs to be present to use axes.');
		}

		const domFacade = executionParameters.domFacade;

		const /** !Node */ contextNode = contextItem.value;
		return SequenceFactory.create(generateAncestors(domFacade, this._isInclusive ? contextNode : domFacade.getParentNode(contextNode)))
			.filter(item => {
				return this._ancestorExpression.evaluateToBoolean(dynamicContext, item);
			});
	}
}

export default AncestorAxis;
