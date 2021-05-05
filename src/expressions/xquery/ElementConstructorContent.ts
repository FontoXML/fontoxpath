import { TinyAttributeNode, TinyChildNode, TinyTextNode } from '../../domClone/Pointer';
import { ConcreteAttributeNode, ConcreteChildNode, NODE_TYPES } from '../../domFacade/ConcreteNode';
import ArrayValue from '../dataTypes/ArrayValue';
import { atomizeSingleValue } from '../dataTypes/atomize';
import castToType from '../dataTypes/castToType';
import createPointerValue from '../dataTypes/createPointerValue';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import Value, { BaseType, SequenceType } from '../dataTypes/Value';
import ExecutionParameters from '../ExecutionParameters';
function createTinyTextNode(content): TinyTextNode {
	const tinyTextNode: TinyTextNode = {
		data: content,
		isTinyNode: true,
		nodeType: NODE_TYPES.TEXT_NODE,
	};
	return tinyTextNode;
}
function parseChildNodes(
	childNodes: Value[],
	executionParameters: ExecutionParameters,
	attributes: (ConcreteAttributeNode | TinyAttributeNode)[],
	contentNodes: (ConcreteChildNode | TinyChildNode)[],
	attributesDone: boolean,
	attributeError: (arg0: any, arg1?: any) => Error
): boolean {
	const domFacade = executionParameters.domFacade;
	// Plonk all childNodes, these are special though
	childNodes
		.reduce(function flattenArray(convertedChildNodes: Value[], childNode: Value) {
			if (isSubtypeOf(childNode.type.kind, BaseType.ARRAY)) {
				const arrayValue = childNode as ArrayValue;
				// Flatten out arrays
				arrayValue.members.forEach((member) =>
					member()
						.getAllValues()
						.forEach((item: Value) => flattenArray(convertedChildNodes, item))
				);
				return convertedChildNodes;
			}
			convertedChildNodes.push(childNode);
			return convertedChildNodes;
		}, [])
		.forEach((childNode, i, atomizedChildNodes) => {
			if (isSubtypeOf(childNode.type.kind, BaseType.ATTRIBUTE)) {
				if (attributesDone) {
					throw attributeError(childNode.value, domFacade);
				}
				const attrNode = childNode.value;
				attributes.push(attrNode.node);
				return;
			}
			if (
				isSubtypeOf(childNode.type.kind, BaseType.XSANYATOMICTYPE) ||
				(isSubtypeOf(childNode.type.kind, BaseType.NODE) &&
					domFacade.getNodeType(childNode.value) === NODE_TYPES.TEXT_NODE)
			) {
				// childNode is a textnode-like
				const atomizedValue = isSubtypeOf(childNode.type.kind, BaseType.XSANYATOMICTYPE)
					? castToType(
							atomizeSingleValue(childNode, executionParameters).first(),
							BaseType.XSSTRING
					  ).value
					: domFacade.getDataFromPointer(childNode.value);
				if (
					i !== 0 &&
					isSubtypeOf(atomizedChildNodes[i - 1].type.kind, BaseType.XSANYATOMICTYPE) &&
					isSubtypeOf(childNode.type.kind, BaseType.XSANYATOMICTYPE)
				) {
					contentNodes.push(createTinyTextNode(' ' + atomizedValue));
					attributesDone = true;
					return;
				}
				if (atomizedValue) {
					contentNodes.push(createTinyTextNode('' + atomizedValue));
					attributesDone = true;
				}
				return;
			}
			if (isSubtypeOf(childNode.type.kind, BaseType.DOCUMENTNODE)) {
				const docChildNodes = [];
				domFacade
					.getChildNodePointers(childNode.value)
					.forEach((node) => docChildNodes.push(createPointerValue(node, domFacade)));
				attributesDone = parseChildNodes(
					docChildNodes,
					executionParameters,
					attributes,
					contentNodes,
					attributesDone,
					attributeError
				);
				return;
			}
			if (isSubtypeOf(childNode.type.kind, BaseType.NODE)) {
				// Deep clone child elements
				// TODO: skip copy if the childNode has already been created in the expression
				contentNodes.push(childNode.value.node);
				attributesDone = true;
				return;
			}
			// We now only have unatomizable types left
			// (function || map)
			if (isSubtypeOf(childNode.type.kind, BaseType.FUNCTION)) {
				throw new Error(`FOTY0013: Atomization is not supported for ${childNode.type}.`);
			}
			throw new Error(`Atomizing ${childNode.type} is not implemented.`);
		});
	return attributesDone;
}
export default function parseContent(
	allChildNodes: Value[][],
	executionParameters: ExecutionParameters,
	attributeError: (arg0: any, arg1?: any) => Error
): {
	attributes: (ConcreteAttributeNode | TinyAttributeNode)[];
	contentNodes: (ConcreteChildNode | TinyChildNode)[];
} {
	const attributes = [];
	const contentNodes = [];
	let attributesDone = false;
	// Plonk all childNodes, these are special though
	allChildNodes.forEach((childNodes) => {
		attributesDone = parseChildNodes(
			childNodes,
			executionParameters,
			attributes,
			contentNodes,
			attributesDone,
			attributeError
		);
	});
	return { attributes, contentNodes };
}
