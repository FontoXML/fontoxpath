import builtinStringFunctions from './builtInFunctions.string';
import Sequence from '../dataTypes/Sequence';
import { sortNodeValues } from '../dataTypes/documentOrderUtils';
import createAtomicValue from '../dataTypes/createAtomicValue';
var stringFunctions = builtinStringFunctions.functions;
function contextItemAsFirstArgument (fn, dynamicContext) {
	return fn(dynamicContext, Sequence.singleton(dynamicContext.contextItem));
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
	var nodeName = sequence.first().nodeName;
	if (nodeName === null) {
		return Sequence.empty();
	}
	return Sequence.singleton(createAtomicValue(nodeName, 'xs:QName'));
}

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

	var resultNodes = sortNodeValues(dynamicContext.domFacade, nodeSequence.getAllValues())
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

	var resultNodes = sortNodeValues(dynamicContext.domFacade, nodeSequence.getAllValues())
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
		}
	],
	functions: {
		name: fnName,
		nodeName: fnNodeName
	}
};
