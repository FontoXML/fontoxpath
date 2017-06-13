import Selector from '../Selector';
import Specificity from '../Specificity';
import Sequence from '../dataTypes/Sequence';
import createNodeValue from '../dataTypes/createNodeValue';
import AttributeNode from '../dataTypes/AttributeNode';
import isSubtypeOf from '../dataTypes/isSubtypeOf';

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
		}), {
			resultOrder: Selector.RESULT_ORDERINGS.UNSORTED,
			subtree: true,
			peer: true,
			canBeStaticallyEvaluated: false
		});

		this._attributeTestSelector = attributeTestSelector;
	}

	/**
	 * @param   {../DynamicContext}  dynamicContext
	 * @return  {Sequence}
	 */
	evaluate (dynamicContext) {
		var contextItem = dynamicContext.contextItem,
			domFacade = dynamicContext.domFacade;

		if (!isSubtypeOf(contextItem.type, 'element()')) {
			return Sequence.empty();
		}

		const allAttributes = domFacade.getAllAttributes(contextItem.value);
		var attributesSequence = new Sequence(
			allAttributes.map(
				attribute => createNodeValue(
					new AttributeNode(contextItem.value, attribute.name, attribute.value))));
		/**
		 * @type {!Selector}
		 */
		const attributeTestSelector = this._attributeTestSelector;
		return attributesSequence.filter((item, i) => {
			const result = attributeTestSelector.evaluateMaybeStatically(dynamicContext.scopeWithFocus(i, item, attributesSequence));
			return result.getEffectiveBooleanValue();
		});
	}
}
export default AttributeAxis;
