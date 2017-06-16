import isSubtypeOf from '../dataTypes/isSubtypeOf';
import createNodeValue from '../dataTypes/createNodeValue';
import Sequence from '../dataTypes/Sequence';

function findDescendants (domFacade, node, isMatch) {
	const results = domFacade.getChildNodes(node)
		.reduce(function (matchingNodes, childNode) {
			Array.prototype.push.apply(matchingNodes, findDescendants(domFacade, childNode, isMatch));
			return matchingNodes;
		}, []);
	if (isMatch(node)) {
		results.unshift(node);
	}
	return results;
}

/**
 * @param  {!../DynamicContext}      dynamicContext
 * @param  {!../dataTypes/Sequence}  idrefSequence
 * @param  {!../dataTypes/Sequence}  targetNodeSequence
 * @return  {!../dataTypes/Sequence}
 */
function fnId (dynamicContext, idrefSequence, targetNodeSequence) {
	const targetNodeValue = targetNodeSequence.first();
	if (!isSubtypeOf(targetNodeValue.type, 'node()')) {
		return Sequence.empty();
	}
	/**
	 * @type {!IDomFacade}
	 */
	const domFacade = dynamicContext.domFacade;
	// TODO: Index ids to optimize this lookup
	/**
	 * @type {!IObject<string, boolean>}
	 */
	const isMatchingIdById = idrefSequence.getAllValues().reduce(function (byId, idrefValue) {
			idrefValue.value.split(/\s+/).forEach(function (id) {
				byId[id] = true;
			});
			return byId;
		}, Object.create(null));
	const documentNode = targetNodeValue.value.nodeType === targetNodeValue.value.DOCUMENT_NODE ? targetNodeValue.value : targetNodeValue.value.ownerDocument;

	const matchingNodes = findDescendants(
			domFacade,
			documentNode,
			function (node) {
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
	return new Sequence(matchingNodes.map(createNodeValue));
}

/**
 * @param  {!../DynamicContext}      dynamicContext
 * @param  {!../dataTypes/Sequence}  idSequence
 * @param  {!../dataTypes/Sequence}  targetNodeSequence
 * @return  {!../dataTypes/Sequence}
 */
function fnIdref (dynamicContext, idSequence, targetNodeSequence) {
	const targetNodeValue = targetNodeSequence.first();
	if (!isSubtypeOf(targetNodeValue.type, 'node()')) {
		return Sequence.empty();
	}
	/**
	 * @type {!IDomFacade}
	 */
	const domFacade = dynamicContext.domFacade;
	/**
	 * @type {!IObject<string, boolean>}
	 */
	const isMatchingIdRefById = idSequence.getAllValues().reduce(function (byId, idValue) {
			byId[idValue.value] = true;
			return byId;
		}, Object.create(null));
	const documentNode = targetNodeValue.value.nodeType === targetNodeValue.value.DOCUMENT_NODE ?
		targetNodeValue.value : targetNodeValue.value.ownerDocument;
	// TODO: Index idrefs to optimize this lookup
	const matchingNodes = findDescendants(
			domFacade,
			documentNode,
			function (node) {
				// TODO: use the is-idrefs property of attributes / elements
				if (node.nodeType !== node.ELEMENT_NODE) {
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
	return new Sequence(matchingNodes.map(createNodeValue));
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
				return fnId(dynamicContext, strings, Sequence.singleton(dynamicContext.contextItem));
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
				return fnIdref(dynamicContext, strings, Sequence.singleton(dynamicContext.contextItem));
			}
		}
	],
	functions: {
		id: fnId,
		idref: fnIdref
	}
};
