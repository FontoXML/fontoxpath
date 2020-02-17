import castToType from '../dataTypes/castToType';
import createNodeValue from '../dataTypes/createNodeValue';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import Value from '../dataTypes/Value';
import ExecutionParameters from '../ExecutionParameters';
import { atomizeSingleValue } from '../dataTypes/atomize';
import ArrayValue from '../dataTypes/ArrayValue';

function parseChildNodes(
	childNodes: Value[],
	executionParameters: ExecutionParameters,
	attributes: any[],
	contentNodes: any[],
	attributesDone: boolean,
	attributeError: (arg0: any) => Error
) {
	const nodesFactory = executionParameters.nodesFactory;

	// Plonk all childNodes, these are special though
	childNodes
		.reduce(function flattenArray(convertedChildNodes: Value[], childNode: Value) {
			if (isSubtypeOf(childNode.type, 'array(*)')) {
				const arrayValue = childNode as ArrayValue;
				// Flatten out arrays
				arrayValue.members.forEach(member =>
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
			if (isSubtypeOf(childNode.type, 'attribute()')) {
				if (attributesDone) {
					throw attributeError(childNode.value);
				}

				const attrNode = childNode.value;
				attributes.push(attrNode);
				return;
			}

			if (isSubtypeOf(childNode.type, 'xs:anyAtomicType')) {
				const atomizedValue = castToType(
					atomizeSingleValue(childNode, executionParameters).first(),
					'xs:string'
				).value;
				if (i !== 0 && isSubtypeOf(atomizedChildNodes[i - 1].type, 'xs:anyAtomicType')) {
					contentNodes.push(nodesFactory.createTextNode(' ' + atomizedValue));
					attributesDone = true;
					return;
				}
				if (atomizedValue) {
					contentNodes.push(nodesFactory.createTextNode('' + atomizedValue));
					attributesDone = true;
				}
				return;
			}

			if (isSubtypeOf(childNode.type, 'document()')) {
				const docChildNodes = [];
				childNode.value.childNodes.forEach(node =>
					docChildNodes.push(createNodeValue(node))
				);
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

			if (isSubtypeOf(childNode.type, 'node()')) {
				// Deep clone child elements
				// TODO: skip copy if the childNode has already been created in the expression
				contentNodes.push(childNode.value.cloneNode(true));
				attributesDone = true;
				return;
			}

			// We now only have unatomizable types left
			// (function || map)
			if (isSubtypeOf(childNode.type, 'function(*)')) {
				throw new Error(`FOTY0013: Atomization is not supported for ${childNode.type}.`);
			}
			throw new Error(`Atomizing ${childNode.type} is not implemented.`);
		});

	return attributesDone;
}

export default function parseContent(
	allChildNodes: Value[][],
	executionParameters: ExecutionParameters,
	attributeError: (arg0: any) => Error
) {
	const attributes = [];
	const contentNodes = [];

	let attributesDone = false;
	// Plonk all childNodes, these are special though
	allChildNodes.forEach(childNodes => {
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
