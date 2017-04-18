import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import NodeValue from '../dataTypes/NodeValue';

/**
 * @extends {Selector}
 */
class PrecedingSiblingAxis extends Selector {
	/**
	 * @param  {Selector}  siblingSelector
	 */
	constructor (siblingSelector) {
		super(siblingSelector.specificity, Selector.RESULT_ORDERINGS.REVERSE_SORTED);

		this._siblingSelector = siblingSelector;
		this._getStringifiedValue = () => `(preceding-sibling ${this._siblingSelector.toString()})`;
	}

	/**
	 * @param   {../DynamicContext}  dynamicContext
	 * @return  {Sequence}
	 */
	evaluate (dynamicContext) {
		var contextItem = dynamicContext.contextItem,
        domFacade = dynamicContext.domFacade;

		const siblingSelector = this._siblingSelector;
		const siblingSequence = new Sequence(function* () {
			var sibling = contextItem.value;
			while ((sibling = domFacade.getPreviousSibling(sibling))) {
				yield new NodeValue(sibling);
			}
		});

		return new Sequence(function* () {
			for (const childContext of dynamicContext.createSequenceIterator(siblingSequence)) {
				const nodeIsMatch = siblingSelector.evaluate(childContext).getEffectiveBooleanValue();
				if (nodeIsMatch) {
					yield childContext.contextItem;
				}
			}
		});
	}
}

export default PrecedingSiblingAxis;
