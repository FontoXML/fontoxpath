import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import createNodeValue from '../dataTypes/createNodeValue';

function generateAncestors (domFacade, contextNode) {
	let ancestor = contextNode;
	return {
		next: () => {
			if (!ancestor) {
				return { done: true, ready: true, value: undefined };
			}
			const previousAncestor = ancestor;
			ancestor = previousAncestor && domFacade.getParentNode(previousAncestor);

			return {
				done: false,
				ready: true,
				value: createNodeValue(previousAncestor)
			};
		}
	};
}

/**
 * @extends {Selector}
 */
class AncestorAxis extends Selector {
	/**
	 * @param  {Selector}  ancestorSelector
	 * @param  {{inclusive:boolean}=}    options
	 */
	constructor (ancestorSelector, options) {
		options = options || { inclusive: false };
		super(ancestorSelector.specificity, {
			resultOrder: Selector.RESULT_ORDERINGS.REVERSE_SORTED,
			peer: false,
			subtree: false,
			canBeStaticallyEvaluated: false
		});

		this._ancestorSelector = ancestorSelector;
		this._isInclusive = !!options.inclusive;
	}

	/**
	 * @param   {../DynamicContext}  dynamicContext
	 * @return  {Sequence}
	 */
	evaluate (dynamicContext) {
		const contextItem = dynamicContext.contextItem;
		const domFacade = dynamicContext.domFacade;

		const contextNode = contextItem.value;
		return new Sequence(generateAncestors(domFacade, this._isInclusive ? contextNode : domFacade.getParentNode(contextNode)))
			.filter(item => {
				return this._ancestorSelector.evaluateToBoolean(dynamicContext, item);
			});
	}
}

export default AncestorAxis;
