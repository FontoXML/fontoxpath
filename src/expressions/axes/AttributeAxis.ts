import { ElementNodePointer } from '../../domClone/Pointer';
import { NODE_TYPES } from '../../domFacade/ConcreteNode';
import createPointerValue from '../dataTypes/createPointerValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Expression, { RESULT_ORDERINGS } from '../Expression';
import Specificity from '../Specificity';
import { BUILT_IN_NAMESPACE_URIS } from '../staticallyKnownNamespaces';
import TestAbstractExpression from '../tests/TestAbstractExpression';
import { Bucket, intersectBuckets } from '../util/Bucket';
import validateContextNode from './validateContextNode';

class AttributeAxis extends Expression {
	private readonly _attributeTestExpression: TestAbstractExpression;
	private readonly _filterBucket: Bucket;
	constructor(attributeTestExpression: TestAbstractExpression, filterBucket: Bucket) {
		super(
			new Specificity({
				[Specificity.ATTRIBUTE_KIND]: 1,
			}),
			[attributeTestExpression],
			{
				resultOrder: RESULT_ORDERINGS.UNSORTED,
				subtree: true,
				peer: true,
				canBeStaticallyEvaluated: false,
			}
		);

		this._attributeTestExpression = attributeTestExpression;
		this._filterBucket = intersectBuckets(
			this._attributeTestExpression.getBucket(),
			filterBucket
		);
	}

	public evaluate(dynamicContext: DynamicContext, executionParameters: ExecutionParameters) {
		const domFacade = executionParameters.domFacade;
		const contextItem = validateContextNode(dynamicContext.contextItem) as ElementNodePointer;

		if (domFacade.getNodeType(contextItem) !== NODE_TYPES.ELEMENT_NODE) {
			return sequenceFactory.empty();
		}

		// The spec on attributes:
		// A set of Attribute Nodes constructed from the attribute information
		// items appearing in the [attributes] property.
		// This includes all of the "special" attributes (xml:lang, xml:space, xsi:type, etc.)
		// but does not include namespace declarations (because they are not attributes).
		const matchingAttributes = domFacade
			.getAllAttributePointers(contextItem, this._filterBucket)
			.filter(
				(attr) =>
					domFacade.getNamespaceURI(attr) !== BUILT_IN_NAMESPACE_URIS.XMLNS_NAMESPACE_URI
			)
			.map((attribute) => createPointerValue(attribute, executionParameters.domFacade))
			.filter((item) =>
				this._attributeTestExpression.evaluateToBoolean(
					dynamicContext,
					item,
					executionParameters
				)
			);
		return sequenceFactory.create(matchingAttributes);
	}

	public override getBucket(): Bucket {
		// The attribute axis is a non-empty sequence for only elements
		return 'type-1';
	}
}
export default AttributeAxis;
