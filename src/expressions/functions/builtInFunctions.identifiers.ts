import createPointerValue from '../dataTypes/createPointerValue';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { errXPTY0004, XPDY0002 } from '../XPathErrors';

import { FUNCTIONS_NAMESPACE_URI } from '../staticallyKnownNamespaces';

import { NODE_TYPES } from '../../domFacade/ConcreteNode';
import FunctionDefinitionType from './FunctionDefinitionType';

function findDescendants(domFacade, node, isMatch) {
	const results = domFacade
		.getChildNodePointers(node)
		.reduce(function (matchingNodes, childNode) {
			Array.prototype.push.apply(
				matchingNodes,
				findDescendants(domFacade, childNode, isMatch)
			);
			return matchingNodes;
		}, []);
	if (isMatch(node)) {
		results.unshift(node);
	}
	return results;
}

const fnId: FunctionDefinitionType = function (
	_dynamicContext,
	executionParameters,
	_staticContext,
	idrefSequence,
	targetNodeSequence
) {
	const targetNodeValue = targetNodeSequence.first();
	if (!targetNodeValue) {
		throw XPDY0002('The context is absent, it needs to be present to use id function.');
	}
	if (!isSubtypeOf(targetNodeValue.type, 'node()')) {
		throw errXPTY0004(
			'The context item is not a node, it needs to be node to use id function.'
		);
	}

	const domFacade = executionParameters.domFacade;
	// TODO: Index ids to optimize this lookup
	const isMatchingIdById: { [s: string]: boolean } = idrefSequence
		.getAllValues()
		.reduce(function (byId, idrefValue) {
			idrefValue.value.split(/\s+/).forEach(function (id) {
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

	const matchingNodes = findDescendants(domFacade, documentNode, (node) => {
		// TODO: use the is-id property of attributes / elements
		if (domFacade.getNodeType(node) !== NODE_TYPES.ELEMENT_NODE) {
			return false;
		}
		const idAttribute = domFacade.getAttribute(node, 'id');
		if (!idAttribute) {
			return false;
		}
		if (!isMatchingIdById[idAttribute]) {
			return false;
		}
		// Only return the first match, per id
		isMatchingIdById[idAttribute] = false;
		return true;
	});
	return sequenceFactory.create(matchingNodes.map((node) => createPointerValue(node, domFacade)));
};

const fnIdref: FunctionDefinitionType = function (
	_dynamicContext,
	executionParameters,
	_staticContext,
	idSequence,
	targetNodeSequence
) {
	const targetNodeValue = targetNodeSequence.first();
	if (!targetNodeValue) {
		throw XPDY0002('The context is absent, it needs to be present to use idref function.');
	}
	if (!isSubtypeOf(targetNodeValue.type, 'node()')) {
		throw errXPTY0004(
			'The context item is not a node, it needs to be node to use idref function.'
		);
	}

	const domFacade = executionParameters.domFacade;

	const isMatchingIdRefById = idSequence.getAllValues().reduce(function (byId, idValue) {
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

	// TODO: Index idrefs to optimize this lookup
	const matchingNodes = findDescendants(domFacade, documentNode, function (node) {
		// TODO: use the is-idrefs property of attributes / elements
		if (domFacade.getNodeType(node) !== NODE_TYPES.ELEMENT_NODE) {
			return false;
		}
		const idAttribute = domFacade.getAttribute(node, 'idref');
		if (!idAttribute) {
			return false;
		}
		const idRefs = idAttribute.split(/\s+/);
		return idRefs.some(function (idRef) {
			return isMatchingIdRefById[idRef];
		});
	});
	return sequenceFactory.create(matchingNodes.map((node) => createPointerValue(node, domFacade)));
};

export default {
	declarations: [
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'id',
			argumentTypes: ['xs:string*', 'node()'],
			returnType: 'element()*',
			callFunction: fnId,
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'id',
			argumentTypes: ['xs:string*'],
			returnType: 'element()*',
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
			argumentTypes: ['xs:string*', 'node()'],
			returnType: 'node()*',
			callFunction: fnIdref,
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'idref',
			argumentTypes: ['xs:string*'],
			returnType: 'node()*',
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
	],
	functions: {
		id: fnId,
		idref: fnIdref,
	},
};
