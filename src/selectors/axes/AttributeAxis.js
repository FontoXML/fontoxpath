import Selector from '../Selector';
import Specificity from '../Specificity';
import Sequence from '../dataTypes/Sequence';
import createNodeValue from '../dataTypes/createNodeValue';
import isSubtypeOf from '../dataTypes/isSubtypeOf';

/**
 * @extends {Selector}
 */
class AttributeAxis extends Selector {
	/**
	 * @param  {!../tests/TestAbstractExpression}  attributeTestSelector
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
		/**
		 * @type {../dataTypes/Value}
		 */
		const contextItem = dynamicContext.contextItem;
		if (contextItem === null) {
			throw new Error('XPDY0002: context is absent, it needs to be present to use axes.');
		}

		const domFacade = dynamicContext.domFacade;

		if (!isSubtypeOf(contextItem.type, 'element()')) {
			return Sequence.empty();
		}

		// The spec on attributes:
		// A set of Attribute Nodes constructed from the attribute information
		// items appearing in the [attributes] property.
		// This includes all of the "special" attributes (xml:lang, xml:space, xsi:type, etc.)
		// but does not include namespace declarations (because they are not attributes).
		const matchingAttributes = domFacade.getAllAttributes(contextItem.value)
			.filter(attr => attr.namespaceURI !== 'http://www.w3.org/2000/xmlns/')
			.map(attribute => createNodeValue(attribute))
			.filter(item => this._attributeTestSelector.evaluateToBoolean(dynamicContext, item));
		return new Sequence(matchingAttributes);
	}

	getBucket () {
		// The attribute axis is a non-empty sequence for only elements
		return 'type-1';
	}
}
export default AttributeAxis;
