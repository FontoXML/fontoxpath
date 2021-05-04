import { ElementNodePointer, NodePointer, ParentNodePointer } from '../../domClone/Pointer';
import { NODE_TYPES } from '../../domFacade/ConcreteNode';
import DomFacade from '../../domFacade/DomFacade';
import createPointerValue from '../dataTypes/createPointerValue';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { BaseType, SequenceType } from '../dataTypes/Value';
import { FUNCTIONS_NAMESPACE_URI } from '../staticallyKnownNamespaces';
import { errXPTY0004, XPDY0002 } from '../XPathErrors';
import { BuiltinDeclarationType } from './builtInFunctions';
import FunctionDefinitionType from './FunctionDefinitionType';

function findDescendants(
	domFacade: DomFacade,
	node: NodePointer,
	isMatch: (node: NodePointer) => boolean
): Node[] {
	if (
		node.node.nodeType !== NODE_TYPES.ELEMENT_NODE &&
		node.node.nodeType !== NODE_TYPES.DOCUMENT_NODE
	) {
		return [];
	}
	const results = domFacade
		.getChildNodePointers(node as ParentNodePointer)
		.reduce((matchingNodes, childNode) => {
			for (const descendant of findDescendants(domFacade, childNode, isMatch)) {
				matchingNodes.push(descendant);
			}
			return matchingNodes;
		}, []);
	if (isMatch(node)) {
		results.unshift(node);
	}
	return results;
}

const fnId: FunctionDefinitionType = (
	_dynamicContext,
	executionParameters,
	_staticContext,
	idrefSequence,
	targetNodeSequence
) => {
	const targetNodeValue = targetNodeSequence.first();
	if (!targetNodeValue) {
		throw XPDY0002('The context is absent, it needs to be present to use id function.');
	}
	if (
		!isSubtypeOf(targetNodeValue.type, {
			kind: BaseType.NODE,
			seqType: SequenceType.EXACTLY_ONE,
		})
	) {
		throw errXPTY0004(
			'The context item is not a node, it needs to be node to use id function.'
		);
	}

	const domFacade = executionParameters.domFacade;
	// TODO: Index ids to optimize this lookup
	const isMatchingIdById: { [s: string]: boolean } = idrefSequence
		.getAllValues()
		.reduce((byId, idrefValue) => {
			idrefValue.value.split(/\s+/).forEach((id) => {
				byId[id] = true;
			});
			return byId;
		}, Object.create(null));

	let documentNode = targetNodeValue.value;
	while (domFacade.getNodeType(documentNode) !== NODE_TYPES.DOCUMENT_NODE) {
		documentNode = domFacade.getParentNodePointer(documentNode);
		if (documentNode === null) {
			throw new Error('FODC0001: the root node of the target node is not a document node.');
		}
	}

	// Note the cast: The filter is only matching element node pointers
	const matchingNodes = (findDescendants(domFacade, documentNode, (node) => {
		// TODO: use the is-id property of attributes / elements
		if (domFacade.getNodeType(node) !== NODE_TYPES.ELEMENT_NODE) {
			return false;
		}
		const elementNode = node as ElementNodePointer;
		const idAttribute = domFacade.getAttribute(elementNode, 'id');
		if (!idAttribute) {
			return false;
		}
		if (!isMatchingIdById[idAttribute]) {
			return false;
		}
		// Only return the first match, per id
		isMatchingIdById[idAttribute] = false;
		return true;
	}) as unknown) as ElementNodePointer[];
	return sequenceFactory.create(matchingNodes.map((node) => createPointerValue(node, domFacade)));
};

const fnIdref: FunctionDefinitionType = (
	_dynamicContext,
	executionParameters,
	_staticContext,
	idSequence,
	targetNodeSequence
) => {
	const targetNodeValue = targetNodeSequence.first();
	if (!targetNodeValue) {
		throw XPDY0002('The context is absent, it needs to be present to use idref function.');
	}
	if (
		!isSubtypeOf(targetNodeValue.type, {
			kind: BaseType.NODE,
			seqType: SequenceType.EXACTLY_ONE,
		})
	) {
		throw errXPTY0004(
			'The context item is not a node, it needs to be node to use idref function.'
		);
	}

	const domFacade = executionParameters.domFacade;

	const isMatchingIdRefById = idSequence.getAllValues().reduce((byId, idValue) => {
		byId[idValue.value] = true;
		return byId;
	}, Object.create(null));

	let documentNode = targetNodeValue.value;
	while (domFacade.getNodeType(documentNode) !== NODE_TYPES.DOCUMENT_NODE) {
		documentNode = domFacade.getParentNodePointer(documentNode);
		if (documentNode === null) {
			throw new Error('FODC0001: the root node of the context node is not a document node.');
		}
	}

	// Note the cast: The filter is only matching element node pointers
	// TODO: Index idrefs to optimize this lookup
	const matchingNodes = (findDescendants(domFacade, documentNode, (node) => {
		// TODO: use the is-idrefs property of attributes / elements
		if (domFacade.getNodeType(node) !== NODE_TYPES.ELEMENT_NODE) {
			return false;
		}
		const element = node as ElementNodePointer;
		const idAttribute = domFacade.getAttribute(element, 'idref');
		if (!idAttribute) {
			return false;
		}
		const idRefs = idAttribute.split(/\s+/);
		return idRefs.some((idRef) => {
			return isMatchingIdRefById[idRef];
		});
	}) as unknown) as ElementNodePointer[];
	return sequenceFactory.create(matchingNodes.map((node) => createPointerValue(node, domFacade)));
};

const declarations: BuiltinDeclarationType[] = [
	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'id',
		argumentTypes: [
			{ kind: BaseType.XSSTRING, seqType: SequenceType.ZERO_OR_MORE },
			{ kind: BaseType.NODE, seqType: SequenceType.EXACTLY_ONE },
		],
		returnType: { kind: BaseType.ELEMENT, seqType: SequenceType.ZERO_OR_MORE },
		callFunction: fnId,
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'id',
		argumentTypes: [{ kind: BaseType.XSSTRING, seqType: SequenceType.ZERO_OR_MORE }],
		returnType: { kind: BaseType.ELEMENT, seqType: SequenceType.ZERO_OR_MORE },
		callFunction(dynamicContext, executionParameters, _staticContext, strings) {
			return fnId(
				dynamicContext,
				executionParameters,
				_staticContext,
				strings,
				sequenceFactory.singleton(dynamicContext.contextItem)
			);
		},
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'idref',
		argumentTypes: [
			{ kind: BaseType.XSSTRING, seqType: SequenceType.ZERO_OR_MORE },
			{ kind: BaseType.NODE, seqType: SequenceType.EXACTLY_ONE },
		],
		returnType: { kind: BaseType.NODE, seqType: SequenceType.ZERO_OR_MORE },
		callFunction: fnIdref,
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'idref',
		argumentTypes: [{ kind: BaseType.XSSTRING, seqType: SequenceType.ZERO_OR_MORE }],
		returnType: { kind: BaseType.NODE, seqType: SequenceType.ZERO_OR_MORE },
		callFunction(dynamicContext, executionParameters, _staticContext, strings) {
			return fnIdref(
				dynamicContext,
				executionParameters,
				_staticContext,
				strings,
				sequenceFactory.singleton(dynamicContext.contextItem)
			);
		},
	},
];

export default {
	declarations,
	functions: {
		id: fnId,
		idref: fnIdref,
	},
};
