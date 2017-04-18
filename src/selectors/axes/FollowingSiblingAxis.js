import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import NodeValue from '../dataTypes/NodeValue';

/**
 * @extends {Selector}
 */
class FollowingSiblingAxis extends Selector {
	/**
	 * @param  {Selector}  siblingSelector
	 */
	constructor (siblingSelector) {
		super(siblingSelector.specificity, Selector.RESULT_ORDERINGS.SORTED);

		this._siblingSelector = siblingSelector;
		this._getStringifiedValue = () => `(following-sibling ${this._siblingSelector.toString()})`;
	}

	/**
	 * @param   {../DynamicContext}  dynamicContext
	 * @return  {Sequence}
	 */
	evaluate (dynamicContext) {
		var contextItem = dynamicContext.contextItem,
        domFacade = dynamicContext.domFacade;

		const siblingSelector = this._siblingSelector;
		return new Sequence(function* () {
			const siblingSequence = new Sequence(function* () {
				var sibling = contextItem.value;
				while ((sibling = domFacade.getNextSibling(sibling))) {
					yield new NodeValue(sibling);
				}
			});

			for (const childContext of dynamicContext.createSequenceIterator(siblingSequence)) {
				const nodeIsMatch = siblingSelector.evaluate(childContext).getEffectiveBooleanValue();
				if (nodeIsMatch) {
					yield childContext.contextItem;
				}
			}
		});
	}
}

export default FollowingSiblingAxis;
