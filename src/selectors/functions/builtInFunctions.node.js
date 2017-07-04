import builtinStringFunctions from './builtInFunctions.string';
import Sequence from '../dataTypes/Sequence';
import { sortNodeValues } from '../dataTypes/documentOrderUtils';
import createAtomicValue from '../dataTypes/createAtomicValue';
import QName from '../dataTypes/valueTypes/QName';
/**
 * @type {function(../DynamicContext, !Sequence): !Sequence}
 */
const fnString = builtinStringFunctions.functions.string;

function contextItemAsFirstArgument (fn, dynamicContext) {
	if (dynamicContext.contextItem === null) {
		throw new Error('XPDY0002: The function which was called depends on dynamic context, which is absent.');
	}
	return fn(dynamicContext, Sequence.singleton(dynamicContext.contextItem));
}

function fnName (dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return fnString(dynamicContext, fnNodeName(dynamicContext, sequence));
}

function fnNamespaceURI (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return Sequence.singleton(createAtomicValue(sequence.first().value.namespaceURI || '', 'xs:anyURI'));
}

function fnLocalName (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return Sequence.singleton(createAtomicValue('', 'xs:string'));
	}
	/**
	 * @type {Node}
	 */
	const node = sequence.first().value;

	if (node.nodeType === 7) {
		const pi = /** @type {ProcessingInstruction} */ (node);
		return Sequence.singleton(createAtomicValue(pi.target, 'xs:string'));
	}

	return Sequence.singleton(createAtomicValue(node.localName || '', 'xs:string'));
}

function fnNodeName (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	/**
	 * @type {Node}
	 */
	const node = sequence.first().value;
	switch (node.nodeType) {
		case 1:
		case 2:
			// element or attribute
			return Sequence.singleton(createAtomicValue(new QName(node.prefix, node.namespaceURI, node.localName), 'xs:QName'));
		case 7:
			// A processing instruction's target is its nodename (https://www.w3.org/TR/xpath-functions-31/#func-node-name)
			const processingInstruction = /** @type {ProcessingInstruction} */ (node);
			return Sequence.singleton(createAtomicValue(new QName('', '', processingInstruction.target), 'xs:QName'));
		default:
			// All other nodes have no name
		return Sequence.empty();
	}
}

/**
 * @param   {IDomFacade}  domFacade
 * @param   {Node}        ancestor
 * @param   {Node}        descendant
 * @return  {boolean}
 */
function contains (domFacade, ancestor, descendant) {
	if (ancestor.nodeType === 2) {
		return ancestor === descendant;
	}
	while (descendant) {
		if (ancestor === descendant) {
			return true;
		}
		descendant = domFacade.getParentNode(descendant);
	}
	return false;
}

function fnOutermost (dynamicContext, nodeSequence) {
	if (nodeSequence.isEmpty()) {
		return nodeSequence;
	}

	/**
	 * @type {Array<Node>}
	 */
	const resultNodes = sortNodeValues(dynamicContext.domFacade, nodeSequence.getAllValues())
		.reduce(function (previousNodes, node, i) {
			if (i === 0) {
				previousNodes.push(node);
				return previousNodes;
			}
			// Because the nodes are sorted, the previous node is either a 'previous node', or an ancestor of this node
			if (contains(dynamicContext.domFacade, previousNodes[previousNodes.length - 1].value, node.value)) {
				// The previous node is an ancestor
				return previousNodes;
			}

			previousNodes.push(node);
			return previousNodes;
		}, []);

	return new Sequence(resultNodes);
}

function fnInnermost (dynamicContext, nodeSequence) {
	if (nodeSequence.isEmpty()) {
		return nodeSequence;
	}

	/**
	 * @type {Array<Node>}
	 */
	const resultNodes = sortNodeValues(dynamicContext.domFacade, nodeSequence.getAllValues())
		.reduceRight(function (followingNodes, node, i, allNodes) {
			if (i === allNodes.length - 1) {
				followingNodes.push(node);
				return followingNodes;
			}
			// Because the nodes are sorted, the following node is either a 'following node', or a descendant of this node
			if (contains(dynamicContext.domFacade, node.value, followingNodes[0].value)) {
				// The previous node is an ancestor
				return followingNodes;
			}

			followingNodes.unshift(node);
			return followingNodes;
		}, []);

	return new Sequence(resultNodes);
}

export default {
	declarations: [
		{
			name: 'name',
			argumentTypes: ['node()?'],
			returnType: 'xs:string',
			callFunction: fnName
		},

		{
			name: 'name',
			argumentTypes: [],
			returnType: 'xs:string',
			callFunction: contextItemAsFirstArgument.bind(null, fnName)
		},

		{
			name: 'namespace-uri',
			argumentTypes: ['node()'],
			returnType: 'xs:anyURI',
			callFunction: fnNamespaceURI
		},

		{
			name: 'namespace-uri',
			argumentTypes: [],
			returnType: 'xs:anyURI',
			callFunction: contextItemAsFirstArgument.bind(null, fnNamespaceURI)
		},

		{
			name: 'innermost',
			argumentTypes: ['node()*'],
			returnType: 'node()*',
			callFunction: fnInnermost
		},

		{
			name: 'outermost',
			argumentTypes: ['node()*'],
			returnType: 'node()*',
			callFunction: fnOutermost
		},

		{
			name: 'node-name',
			argumentTypes: ['node()?'],
			returnType: 'xs:QName?',
			callFunction: fnNodeName
		},

		{
			name: 'node-name',
			argumentTypes: [],
			returnType: 'xs:QName?',
			callFunction: contextItemAsFirstArgument.bind(null, fnNodeName)
		},

		{
			name: 'local-name',
			argumentTypes: ['node()?'],
			returnType: 'xs:string',
			callFunction: fnLocalName
		},

		{
			name: 'local-name',
			argumentTypes: [],
			returnType: 'xs:string',
			callFunction: contextItemAsFirstArgument.bind(null, fnLocalName)
		}
	],
	functions: {
		name: fnName,
		nodeName: fnNodeName
	}
};
