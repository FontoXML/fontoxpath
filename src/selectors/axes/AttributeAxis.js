import Selector from '../Selector';
import Specificity from '../Specificity';
import Sequence from '../dataTypes/Sequence';
import NodeValue from '../dataTypes/NodeValue';
import AttributeNode from '../dataTypes/AttributeNode';

/**
 * @extends {Selector}
 */
class AttributeAxis extends Selector {
	/**
	 * @param  {!Selector}    attributeTestSelector
	 */
	constructor (attributeTestSelector) {
		super(new Specificity({
			[Specificity.ATTRIBUTE_KIND]: 1
		}), Selector.RESULT_ORDERINGS.UNSORTED);

		this._attributeTestSelector = attributeTestSelector;
	}

	equals (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof AttributeAxis &&
			this._attributeTestSelector.equals(otherSelector._attributeTestSelector);
	}

	evaluate (dynamicContext) {
		var contextItem = dynamicContext.contextItem,
        domFacade = dynamicContext.domFacade;

		if (!contextItem.value[0].instanceOfType('element()')) {
			return Sequence.empty();
		}

		var attributes = domFacade
			.getAllAttributes(contextItem.value[0].value)
			.map(function (attribute) {
				return new NodeValue(domFacade, new AttributeNode(
					contextItem.value[0].value,
					attribute.name,
					attribute.value
				));
			}).filter(function (attributeNodeValue) {
				var scopedContext = dynamicContext.createScopedContext({
						contextItem: Sequence.singleton(attributeNodeValue)
					});
				return this._attributeTestSelector.evaluate(scopedContext).getEffectiveBooleanValue();
			}.bind(this));

		return new Sequence(attributes);
	}
}
export default AttributeAxis;
