import builtinStringFunctions from './builtInFunctions.string';
import QNameValue from '../dataTypes/QNameValue';
import Sequence from '../dataTypes/Sequence';
import { sortNodeValues } from '../dataTypes/documentOrderUtils';

var stringFunctions = builtinStringFunctions.functions;
function contextItemAsFirstArgument (fn, dynamicContext) {
	return fn(dynamicContext, dynamicContext.contextItem);
}

function fnName (dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return stringFunctions.string(dynamicContext, fnNodeName(dynamicContext, sequence));
}

function fnNodeName (_dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	var nodeName = sequence.value[0].nodeName;
	if (nodeName === null) {
		return Sequence.empty();
	}
	return Sequence.singleton(new QNameValue(nodeName));
}

function contains (domFacade, ancestor, descendant) {
	if (domFacade.isAttributeNode(ancestor)) {
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

	var resultNodes = sortNodeValues(dynamicContext.domFacade, nodeSequence.value)
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

	var resultNodes = sortNodeValues(dynamicContext.domFacade, nodeSequence.value)
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
	],
	functions: {
		name: fnName,
		nodeName: fnNodeName
	}
};
