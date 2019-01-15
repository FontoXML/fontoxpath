import createAtomicValue from '../dataTypes/createAtomicValue';
import { sortNodeValues } from '../dataTypes/documentOrderUtils';
import isSubtypeOfType from '../dataTypes/isSubtypeOf';
import SequenceFactory from '../dataTypes/sequenceFactory';
import QName from '../dataTypes/valueTypes/QName';
import zipSingleton from '../util/zipSingleton';
import builtinStringFunctions from './builtInFunctions.string';

import { ConcreteNode } from '../../domFacade/ConcreteNode';
import IDomFacade from '../../domFacade/IDomFacade';
import createNodeValue from '../dataTypes/createNodeValue';
import { FUNCTIONS_NAMESPACE_URI } from '../staticallyKnownNamespaces';
import FunctionDefinitionType from './FunctionDefinitionType';

const fnString = builtinStringFunctions.functions.string;

function contextItemAsFirstArgument(fn, dynamicContext, executionParameters, _staticContext) {
	if (dynamicContext.contextItem === null) {
		throw new Error(
			'XPDY0002: The function which was called depends on dynamic context, which is absent.'
		);
	}
	return fn(
		dynamicContext,
		executionParameters,
		_staticContext,
		SequenceFactory.singleton(dynamicContext.contextItem)
	);
}

const fnNodeName: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	staticContext,
	sequence
) {
	return zipSingleton([sequence], ([nodeValue]) => {
		if (nodeValue === null) {
			return SequenceFactory.empty();
		}
		switch (nodeValue.value.nodeType) {
			case 1:
			case 2:
				// element or attribute
				return SequenceFactory.singleton(
					createAtomicValue(
						new QName(
							nodeValue.value.prefix,
							nodeValue.value.namespaceURI,
							nodeValue.value.localName
						),
						'xs:QName'
					)
				);
			case 7:
				// A processing instruction's target is its nodename (https://www.w3.org/TR/xpath-functions-31/#func-node-name)
				const processingInstruction =
					/** @type {ProcessingInstruction} */ (nodeValue.value);
				return SequenceFactory.singleton(
					createAtomicValue(new QName('', '', processingInstruction.target), 'xs:QName')
				);
			default:
				// All other nodes have no name
				return SequenceFactory.empty();
		}
	});
};

const fnName: FunctionDefinitionType = function(
	dynamicContext,
	executionParameters,
	staticContext,
	sequence
) {
	return sequence.switchCases({
		empty: () => SequenceFactory.empty(),
		default: () =>
			fnString(
				dynamicContext,
				executionParameters,
				staticContext,
				fnNodeName(dynamicContext, executionParameters, staticContext, sequence)
			)
	});
};

const fnNamespaceURI: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	staticContext,
	sequence
) {
	return sequence.map(node => createAtomicValue(node.value.namespaceURI || '', 'xs:anyURI'));
};

const fnLocalName: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	staticContext,
	sequence
) {
	return sequence.switchCases({
		empty: () => SequenceFactory.singleton(createAtomicValue('', 'xs:string')),
		default: () => {
			return sequence.map(node => {
				if (node.value.nodeType === 7) {
					const pi = /** @type {ProcessingInstruction} */ (node.value);
					return createAtomicValue(pi.target, 'xs:string');
				}

				return createAtomicValue(node.value.localName || '', 'xs:string');
			});
		}
	});
};

function contains(domFacade: IDomFacade, ancestor: Node, descendant: ConcreteNode): boolean {
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

const fnOutermost: FunctionDefinitionType = function(
	_dynamicContext,
	executionParameters,
	_staticContext,
	nodeSequence
) {
	return nodeSequence.mapAll(allNodeValues => {
		if (!allNodeValues.length) {
			return SequenceFactory.empty();
		}

		const resultNodes = sortNodeValues(executionParameters.domFacade, allNodeValues).reduce(
			function(previousNodes, node, i) {
				if (i === 0) {
					previousNodes.push(node);
					return previousNodes;
				}
				// Because the nodes are sorted, the previous node is either a 'previous node', or an ancestor of this node
				if (
					contains(
						executionParameters.domFacade,
						previousNodes[previousNodes.length - 1].value,
						node.value
					)
				) {
					// The previous node is an ancestor
					return previousNodes;
				}

				previousNodes.push(node);
				return previousNodes;
			},
			[]
		);

		return SequenceFactory.create(resultNodes);
	});
};

const fnInnermost: FunctionDefinitionType = function(
	_dynamicContext,
	executionParameters,
	_staticContext,
	nodeSequence
) {
	return nodeSequence.mapAll(allNodeValues => {
		if (!allNodeValues.length) {
			return SequenceFactory.empty();
		}

		const resultNodes = sortNodeValues(
			executionParameters.domFacade,
			allNodeValues
		).reduceRight(function(followingNodes, node, i, allNodes) {
			if (i === allNodes.length - 1) {
				followingNodes.push(node);
				return followingNodes;
			}
			// Because the nodes are sorted, the following node is either a 'following node', or a descendant of this node
			if (contains(executionParameters.domFacade, node.value, followingNodes[0].value)) {
				// The previous node is an ancestor
				return followingNodes;
			}

			followingNodes.unshift(node);
			return followingNodes;
		}, []);

		return SequenceFactory.create(resultNodes);
	});
};

const fnRoot: FunctionDefinitionType = function(
	_dynamicContext,
	executionParameters,
	_staticContext,
	nodeSequence
) {
	return nodeSequence.map(node => {
		if (!isSubtypeOfType(node.type, 'node()')) {
			throw new Error('XPTY0004 Argument passed to fn:root() should be of the type node()');
		}

		let ancestor;
		let parent = node.value;
		while (parent) {
			ancestor = parent;
			parent = executionParameters.domFacade.getParentNode(ancestor);
		}
		return createNodeValue(ancestor);
	});
};

export default {
	declarations: [
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'name',
			argumentTypes: ['node()?'],
			returnType: 'xs:string',
			callFunction: fnName
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'name',
			argumentTypes: [],
			returnType: 'xs:string',
			callFunction: contextItemAsFirstArgument.bind(null, fnName)
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'namespace-uri',
			argumentTypes: ['node()'],
			returnType: 'xs:anyURI',
			callFunction: fnNamespaceURI
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'namespace-uri',
			argumentTypes: [],
			returnType: 'xs:anyURI',
			callFunction: contextItemAsFirstArgument.bind(null, fnNamespaceURI)
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'innermost',
			argumentTypes: ['node()*'],
			returnType: 'node()*',
			callFunction: fnInnermost
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'outermost',
			argumentTypes: ['node()*'],
			returnType: 'node()*',
			callFunction: fnOutermost
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'node-name',
			argumentTypes: ['node()?'],
			returnType: 'xs:QName?',
			callFunction: fnNodeName
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'node-name',
			argumentTypes: [],
			returnType: 'xs:QName?',
			callFunction: contextItemAsFirstArgument.bind(null, fnNodeName)
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'local-name',
			argumentTypes: ['node()?'],
			returnType: 'xs:string',
			callFunction: fnLocalName
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'local-name',
			argumentTypes: [],
			returnType: 'xs:string',
			callFunction: contextItemAsFirstArgument.bind(null, fnLocalName)
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'root',
			argumentTypes: ['node()?'],
			returnType: 'node()?',
			callFunction: fnRoot
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'root',
			argumentTypes: [],
			returnType: 'node()?',
			callFunction: contextItemAsFirstArgument.bind(null, fnRoot)
		}
	],
	functions: {
		name: fnName,
		nodeName: fnNodeName
	}
};
