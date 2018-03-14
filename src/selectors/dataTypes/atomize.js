import isSubtypeOf from './isSubtypeOf';
import createAtomicValue from './createAtomicValue';

/**
 * @param   {!./Value}            value
 * @param   {!../DynamicContext}  dynamicContext
 * @return  {!./AtomicValue}
 */
export default function atomize (value, dynamicContext) {
	if (isSubtypeOf(value.type, 'xs:anyAtomicType') ||
		isSubtypeOf(value.type, 'xs:untypedAtomic') ||
		isSubtypeOf(value.type, 'xs:boolean') ||
		isSubtypeOf(value.type, 'xs:decimal') ||
		isSubtypeOf(value.type, 'xs:double') ||
		isSubtypeOf(value.type, 'xs:float') ||
		isSubtypeOf(value.type, 'xs:integer') ||
		isSubtypeOf(value.type, 'xs:numeric') ||
		isSubtypeOf(value.type, 'xs:QName') ||
		isSubtypeOf(value.type, 'xs:string')) {
		return value;
	}

	if (isSubtypeOf(value.type, 'node()')) {
		// TODO: Mix in types, by default get string value
		if (isSubtypeOf(value.type, 'attribute()')) {
			return createAtomicValue(value.value.value, 'xs:untypedAtomic');
		}

		// Text nodes and documents should return their text, as untyped atomic
		if (isSubtypeOf(value.type, 'text()')) {
			return createAtomicValue(dynamicContext.domFacade.getData(value.value), 'xs:untypedAtomic');
		}
		// comments and PIs are string
		if (isSubtypeOf(value.type, 'comment()') || isSubtypeOf(value.type, 'processing-instruction()')) {
			return createAtomicValue(dynamicContext.domFacade.getData(value.value), 'xs:string');
		}

		// This is an element or a document node. Because we do not know the specific type of this element.
		// Documents should always be an untypedAtomic, of elements, we do not know the type, so they are untypedAtomic too
		var allTextNodes = (function getTextNodes (node) {
			if (node.nodeType === node.TEXT_NODE || node.nodeType === 4) {
				return [node];
			}
			return dynamicContext.domFacade.getChildNodes(node)
				.reduce(function (textNodes, childNode) {
					Array.prototype.push.apply(textNodes, getTextNodes(childNode));
					return textNodes;
				}, []);
		})(value.value);

		return createAtomicValue(allTextNodes.map(function (textNode) {
			return dynamicContext.domFacade.getData(textNode);
		}).join(''), 'xs:untypedAtomic');
	}

	// (function || map) && !array
	if (isSubtypeOf(value.type, 'function(*)') && !isSubtypeOf(value.type, 'array(*)')) {
		throw new Error(`FOTY0013: Atomization is not supported for ${value.type}.`);
	}
	throw new Error(`Atomizing ${value.type} is not implemented.`);
}
