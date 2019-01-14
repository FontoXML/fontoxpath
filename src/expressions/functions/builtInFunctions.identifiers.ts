import createNodeValue from '../dataTypes/createNodeValue';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import SequenceFactory from '../dataTypes/SequenceFactory';

import { FUNCTIONS_NAMESPACE_URI } from '../staticallyKnownNamespaces';

import FunctionDefinitionType from './FunctionDefinitionType';

function findDescendants(domFacade, node, isMatch) {
	const results = domFacade.getChildNodes(node).reduce(function(matchingNodes, childNode) {
		Array.prototype.push.apply(matchingNodes, findDescendants(domFacade, childNode, isMatch));
		return matchingNodes;
	}, []);
	if (isMatch(node)) {
		results.unshift(node);
	}
	return results;
}

const fnId: FunctionDefinitionType = function(
	_dynamicContext,
	executionParameters,
	_staticContext,
	idrefSequence,
	targetNodeSequence
) {
	const targetNodeValue = targetNodeSequence.first();
	if (!isSubtypeOf(targetNodeValue.type, 'node()')) {
		return SequenceFactory.empty();
	}
	const domFacade = executionParameters.domFacade;
	// TODO: Index ids to optimize this lookup
	const isMatchingIdById: { [s: string]: boolean } = idrefSequence
		.getAllValues()
		.reduce(function(byId, idrefValue) {
			idrefValue.value.split(/\s+/).forEach(function(id) {
				byId[id] = true;
			});
			return byId;
		}, Object.create(null));
	const documentNode =
		targetNodeValue.value.nodeType === targetNodeValue.value.DOCUMENT_NODE
			? targetNodeValue.value
			: targetNodeValue.value.ownerDocument;

	const matchingNodes = findDescendants(domFacade, documentNode, function(node) {
		// TODO: use the is-id property of attributes / elements
		if (node.nodeType !== node.ELEMENT_NODE) {
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
	return SequenceFactory.create(matchingNodes.map(createNodeValue));
};

const fnIdref: FunctionDefinitionType = function(
	_dynamicContext,
	executionParameters,
	_staticContext,
	idSequence,
	targetNodeSequence
) {
	const targetNodeValue = targetNodeSequence.first();
	if (!isSubtypeOf(targetNodeValue.type, 'node()')) {
		return SequenceFactory.empty();
	}
	const domFacade = executionParameters.domFacade;

	const isMatchingIdRefById = idSequence.getAllValues().reduce(function(byId, idValue) {
		byId[idValue.value] = true;
		return byId;
	}, Object.create(null));
	const documentNode =
		targetNodeValue.value.nodeType === targetNodeValue.value.DOCUMENT_NODE
			? targetNodeValue.value
			: targetNodeValue.value.ownerDocument;

	// TODO: Index idrefs to optimize this lookup
	const matchingNodes = findDescendants(domFacade, documentNode, function(node) {
		// TODO: use the is-idrefs property of attributes / elements
		if (node.nodeType !== node.ELEMENT_NODE) {
			return false;
		}
		const idAttribute = domFacade.getAttribute(node, 'idref');
		if (!idAttribute) {
			return false;
		}
		const idRefs = idAttribute.split(/\s+/);
		return idRefs.some(function(idRef) {
			return isMatchingIdRefById[idRef];
		});
	});
	return SequenceFactory.create(matchingNodes.map(createNodeValue));
};

export default {
	declarations: [
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'id',
			argumentTypes: ['xs:string*', 'node()'],
			returnType: 'element()*',
			callFunction: fnId
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
					SequenceFactory.singleton(dynamicContext.contextItem)
				);
			}
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'idref',
			argumentTypes: ['xs:string*', 'node()'],
			returnType: 'node()*',
			callFunction: fnIdref
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
					SequenceFactory.singleton(dynamicContext.contextItem)
				);
			}
		}
	],
	functions: {
		id: fnId,
		idref: fnIdref
	}
};
