import NodeValue from '../dataTypes/NodeValue';
import Sequence from '../dataTypes/Sequence';

function findDescendants (domFacade, node, isMatch) {
	var results = domFacade.getChildNodes(node)
		.reduce(function (matchingNodes, childNode) {
			Array.prototype.push.apply(matchingNodes, findDescendants(domFacade, childNode, isMatch));
			return matchingNodes;
		}, []);
	if (isMatch(node)) {
		results.unshift(node);
	}
	return results;
}

function fnId (dynamicContext, idrefSequence, targetNodeSequence) {
	var targetNodeValue = targetNodeSequence.value[0];
	if (!targetNodeValue.instanceOfType('node()')) {
		return Sequence.empty();
	}
	var domFacade = dynamicContext.domFacade;
	// TODO: Index ids to optimize this lookup
	var isMatchingIdById = idrefSequence.value.reduce(function (byId, idrefValue) {
			idrefValue.value.split(/\s+/).forEach(function (id) {
				byId[id] = true;
			});
			return byId;
		}, Object.create(null));
	var documentNode = targetNodeValue.value.nodeType === targetNodeValue.value.DOCUMENT_NODE ?
		targetNodeValue.value : targetNodeValue.value.ownerDocument;

	var matchingNodes = findDescendants(
			domFacade,
			documentNode,
			function (node) {
				// TODO: use the is-id property of attributes / elements
				if (node.nodeType !== node.ELEMENT_NODE) {
					return false;
				}
				var idAttribute = domFacade.getAttribute(node, 'id');
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
	return new Sequence(matchingNodes.map(function (node) {
		return new NodeValue(domFacade, node);
	}));
}

function fnIdref (dynamicContext, idSequence, targetNodeSequence) {
	var targetNodeValue = targetNodeSequence.value[0];
	if (!targetNodeValue.instanceOfType('node()')) {
		return Sequence.empty();
	}
	var domFacade = dynamicContext.domFacade;
	var isMatchingIdRefById = idSequence.value.reduce(function (byId, idValue) {
			byId[idValue.value] = true;
			return byId;
		}, Object.create(null));
	var documentNode = targetNodeValue.value.nodeType === targetNodeValue.value.DOCUMENT_NODE ?
		targetNodeValue.value : targetNodeValue.value.ownerDocument;
	// TODO: Index idrefs to optimize this lookup
	var matchingNodes = findDescendants(
			domFacade,
			documentNode,
			function (node) {
				// TODO: use the is-idrefs property of attributes / elements
				if (node.nodeType !== node.ELEMENT_NODE) {
					return false;
				}
				var idAttribute = domFacade.getAttribute(node, 'idref');
				if (!idAttribute) {
					return false;
				}
				var idRefs = idAttribute.split(/\s+/);
				return idRefs.some(function (idRef) {
					return isMatchingIdRefById[idRef];
				});
			});
	return new Sequence(matchingNodes.map(function (node) {
		return new NodeValue(domFacade, node);
	}));
}

export default {
	declarations: [

		{
			name: 'id',
			argumentTypes: ['xs:string*', 'node()'],
			returnType: 'element()*',
			callFunction: fnId
		},

		{
			name: 'id',
			argumentTypes: ['xs:string*'],
			returnType: 'element()*',
			callFunction: function (dynamicContext, strings) {
				return fnId(dynamicContext, strings, dynamicContext.contextItem);
			}
		},

		{
			name: 'idref',
			argumentTypes: ['xs:string*', 'node()'],
			returnType: 'node()*',
			callFunction: fnIdref
		},

		{
			name: 'idref',
			argumentTypes: ['xs:string*'],
			returnType: 'node()*',
			callFunction: function (dynamicContext, strings) {
				return fnIdref(dynamicContext, strings, dynamicContext.contextItem);
			}
		}
	],
	functions: {
		id: fnId,
		idref: fnIdref
	}
};
