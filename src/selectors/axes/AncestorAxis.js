import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import NodeValue from '../dataTypes/NodeValue';

function* generateAncestors (domFacade, contextNode) {
	for (let ancestorNode = contextNode; ancestorNode; ancestorNode = domFacade.getParentNode(ancestorNode)) {
		yield new NodeValue(ancestorNode);
	}
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
		super(ancestorSelector.specificity, Selector.RESULT_ORDERINGS.REVERSE_SORTED);

		this._ancestorSelector = ancestorSelector;
		this._isInclusive = !!options.inclusive;
		this._getStringifiedValue = () => `(ancestor ${this._isInclusive} ${this._ancestorSelector.toString()})`;
	}

	/**
	 * @param   {../DynamicContext}  dynamicContext
	 * @return  {Sequence}
	 */
	evaluate (dynamicContext) {
		const contextItem = dynamicContext.contextItem;
		const domFacade = dynamicContext.domFacade;

		const contextNode = contextItem.value;
		const ancestorSelector = this._ancestorSelector;
		const isInclusive = this._isInclusive;
		return new Sequence(function* () {
			const ancestorSequence = new Sequence(
				() =>generateAncestors(domFacade, isInclusive ? contextNode : domFacade.getParentNode(contextNode)));
			for (const childContext of dynamicContext.createSequenceIterator(ancestorSequence)) {
				const nodeIsMatch = ancestorSelector.evaluate(childContext).getEffectiveBooleanValue();
				if (nodeIsMatch) {
					yield childContext.contextItem;
				}
			}
		});
	}
}

export default AncestorAxis;
