import atomize from './dataTypes/atomize';
import castToType from './dataTypes/castToType';
import isSubtypeOf from './dataTypes/isSubtypeOf';

export default function parseContent (allChildNodes, executionParameters) {
	/**
	 * @type {INodesFactory}
	 */
	const nodesFactory = executionParameters.nodesFactory;

	const attributes = [];
	const contentNodes = [];

	// Plonk all childNodes, these are special though
	allChildNodes.forEach(/** {!Array<!Value>} */childNodes => {
		childNodes.forEach((childNode, i) => {
			if (isSubtypeOf(childNode.type, 'xs:anyAtomicType')) {
				const atomizedValue = castToType(atomize(childNode, executionParameters), 'xs:string').value;
				if (i !== 0 && isSubtypeOf(childNodes[i - 1].type, 'xs:anyAtomicType')) {
					contentNodes.push(nodesFactory.createTextNode(' ' + atomizedValue));
					return;
				}
				contentNodes.push(nodesFactory.createTextNode('' + atomizedValue));
				return;
			}
			if (isSubtypeOf(childNode.type, 'attribute()')) {
				const attrNode = /** @type {!Attr} */ (childNode.value);
				attributes.push(attrNode);
				return;
			}

			if (isSubtypeOf(childNode.type, 'node()')) {
				// Deep clone child elements
				// TODO: skip copy if the childNode has already been created in the expression
				contentNodes.push(childNode.value.cloneNode(true));
				return;
			}

			// We now only have unatomizable types left
			// (function || map) && !array
			if (isSubtypeOf(childNode.type, 'function(*)') && !isSubtypeOf(childNode.type, 'array(*)')) {
				throw new Error(`FOTY0013: Atomization is not supported for ${childNode.type}.`);
			}
			throw new Error(`Atomizing ${childNode.type} is not implemented.`);
		});
	});

	return { attributes, contentNodes };
}
