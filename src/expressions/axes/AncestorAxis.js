import Expression from '../Expression';
import Sequence from '../dataTypes/Sequence';
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

/**
 * @extends {Expression}
 */
class AncestorAxis extends Expression {
	/**
	 * @param  {!TestAbstractExpression}  ancestorExpression
	 * @param  {{inclusive:boolean}=}    options
	 */
	constructor (ancestorExpression, options) {
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
		return new Sequence(generateAncestors(domFacade, this._isInclusive ? contextNode : domFacade.getParentNode(contextNode)))
			.filter(item => {
				return this._ancestorExpression.evaluateToBoolean(dynamicContext, item);
			});
	}
}

export default AncestorAxis;
