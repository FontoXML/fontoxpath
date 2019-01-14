import createNodeValue from '../dataTypes/createNodeValue';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import SequenceFactory from '../dataTypes/SequenceFactory';
import Expression, { RESULT_ORDERINGS } from '../Expression';
import Specificity from '../Specificity';
import TestAbstractExpression from '../tests/TestAbstractExpression';

class AttributeAxis extends Expression {
	private _attributeTestExpression: TestAbstractExpression;
	constructor(attributeTestExpression: TestAbstractExpression) {
		super(
			new Specificity({
				[Specificity.ATTRIBUTE_KIND]: 1
			}),
			[attributeTestExpression],
			{
				resultOrder: RESULT_ORDERINGS.UNSORTED,
				subtree: true,
				peer: true,
				canBeStaticallyEvaluated: false
			}
		);

		this._attributeTestExpression = attributeTestExpression;
	}

	public evaluate(dynamicContext, executionParameters) {
		const contextItem = dynamicContext.contextItem;
		if (contextItem === null) {
			throw new Error('XPDY0002: context is absent, it needs to be present to use axes.');
		}

		const domFacade = executionParameters.domFacade;

		if (!isSubtypeOf(contextItem.type, 'element()')) {
			return SequenceFactory.empty();
		}

		// The spec on attributes:
		// A set of Attribute Nodes constructed from the attribute information
		// items appearing in the [attributes] property.
		// This includes all of the "special" attributes (xml:lang, xml:space, xsi:type, etc.)
		// but does not include namespace declarations (because they are not attributes).
		const matchingAttributes = domFacade
			.getAllAttributes(contextItem.value)
			.filter(attr => attr.namespaceURI !== 'http://www.w3.org/2000/xmlns/')
			.map(attribute => createNodeValue(attribute))
			.filter(item => this._attributeTestExpression.evaluateToBoolean(dynamicContext, item));
		return SequenceFactory.create(matchingAttributes);
	}

	public getBucket() {
		// The attribute axis is a non-empty sequence for only elements
		return 'type-1';
	}
}
export default AttributeAxis;
