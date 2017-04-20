import isInstanceOfType from './isInstanceOfType';
import createAtomicValue from './createAtomicValue';

/**
 * @param   {!./Value}            value
 * @param   {!../DynamicContext}  dynamicContext
 * @return  {!./AtomicValue}
 */
export default function atomize (value, dynamicContext) {
	if (isInstanceOfType(value, 'xs:anyAtomicType') ||
		isInstanceOfType(value, 'xs:untypedAtomic') ||
		isInstanceOfType(value, 'xs:boolean') ||
		isInstanceOfType(value, 'xs:decimal') ||
		isInstanceOfType(value, 'xs:double') ||
		isInstanceOfType(value, 'xs:float') ||
		isInstanceOfType(value, 'xs:integer') ||
		isInstanceOfType(value, 'xs:numeric') ||
		isInstanceOfType(value, 'xs:QName') ||
		isInstanceOfType(value, 'xs:string')) {
		return value;
	}

	if (isInstanceOfType(value, 'node()')) {
		// TODO: Mix in types, by default get string value
		if (isInstanceOfType(value, 'attribute()')) {
			return value.value.atomize(dynamicContext);
		}

		// Text nodes and documents should return their text, as untyped atomic
		if (isInstanceOfType(value, 'text()')) {
			return createAtomicValue(dynamicContext.domFacade.getData(value.value), 'xs:untypedAtomic');
		}
		// comments and PIs are string
		if (isInstanceOfType(value, 'comment()') || isInstanceOfType(value, 'processing-instruction()')) {
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
	if (isInstanceOfType(value, 'function(*)')) {
		throw new Error('FOTY0013: Not supported on this type.');
	}
	throw new Error('Not implemented');
}
