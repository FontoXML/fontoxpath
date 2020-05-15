import { NODE_TYPES } from '../../domFacade/ConcreteNode';
import {
	AttributeNodePointer,
	ChildNodePointer,
	ElementNodePointer,
	NodePointer,
	ParentNodePointer,
	ProcessingInstructionNodePointer,
} from '../../domClone/Pointer';

import DomFacade from '../../domFacade/DomFacade';
import atomize from '../dataTypes/atomize';
import createAtomicValue from '../dataTypes/createAtomicValue';
import createPointerValue from '../dataTypes/createPointerValue';
import { sortNodeValues } from '../dataTypes/documentOrderUtils';
import ISequence from '../dataTypes/ISequence';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import sequenceFactory from '../dataTypes/sequenceFactory';
import Value from '../dataTypes/Value';
import QName from '../dataTypes/valueTypes/QName';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import arePointersEqual from '../operators/compares/arePointersEqual';
import { FUNCTIONS_NAMESPACE_URI } from '../staticallyKnownNamespaces';
import StaticContext from '../StaticContext';
import { IterationHint } from '../util/iterators';
import zipSingleton from '../util/zipSingleton';
import builtinStringFunctions from './builtInFunctions_string';
import FunctionDefinitionType from './FunctionDefinitionType';

const fnString = builtinStringFunctions.functions.string;

function contextItemAsFirstArgument(
	fn: FunctionDefinitionType,
	dynamicContext: DynamicContext,
	executionParameters: ExecutionParameters,
	staticContext: StaticContext
) {
	if (dynamicContext.contextItem === null) {
		throw new Error(
			'XPDY0002: The function which was called depends on dynamic context, which is absent.'
		);
	}
	return fn(
		dynamicContext,
		executionParameters,
		staticContext,
		sequenceFactory.singleton(dynamicContext.contextItem)
	);
}

const fnNodeName: FunctionDefinitionType = (
	_dynamicContext,
	executionParameters,
	_staticContext,
	sequence
) => {
	return zipSingleton([sequence], ([pointerValue]) => {
		if (pointerValue === null) {
			return sequenceFactory.empty();
		}
		const domFacade = executionParameters.domFacade;
		const pointer: NodePointer = pointerValue.value;
		switch (domFacade.getNodeType(pointer)) {
			case NODE_TYPES.ELEMENT_NODE:
			case NODE_TYPES.ATTRIBUTE_NODE:
				// element or attribute
				const attrOrElPointer = pointer as AttributeNodePointer | ElementNodePointer;
				return sequenceFactory.singleton(
					createAtomicValue(
						new QName(
							domFacade.getPrefix(
								pointer as AttributeNodePointer | ElementNodePointer
							),
							domFacade.getNamespaceURI(
								pointer as AttributeNodePointer | ElementNodePointer
							),
							domFacade.getLocalName(
								pointer as AttributeNodePointer | ElementNodePointer
							)
						),
						'xs:QName'
					)
				);
			case NODE_TYPES.PROCESSING_INSTRUCTION_NODE:
				// A processing instruction's target is its nodename (https://www.w3.org/TR/xpath-functions-31/#func-node-name)
				const processingInstruction = pointer as ProcessingInstructionNodePointer;
				return sequenceFactory.singleton(
					createAtomicValue(
						new QName('', '', domFacade.getTarget(processingInstruction)),
						'xs:QName'
					)
				);
			default:
				// All other nodes have no name
				return sequenceFactory.empty();
		}
	});
};

const fnName: FunctionDefinitionType = (
	dynamicContext,
	executionParameters,
	staticContext,
	sequence
) => {
	return sequence.switchCases({
		default: () =>
			fnString(
				dynamicContext,
				executionParameters,
				staticContext,
				fnNodeName(dynamicContext, executionParameters, staticContext, sequence)
			),
		empty: () => sequenceFactory.empty(),
	});
};

const fnData: FunctionDefinitionType = (
	_dynamicContext,
	executionParameters,
	_staticContext,
	sequence
) => {
	return atomize(sequence, executionParameters);
};

const fnHasChildren: FunctionDefinitionType = (
	_dynamicContext,
	executionParameters,
	_staticContext,
	nodeSequence: ISequence
) => {
	return zipSingleton([nodeSequence], ([pointerValue]: (Value | null)[]) => {
		const pointer: ParentNodePointer = pointerValue ? pointerValue.value : null;

		if (pointer !== null && executionParameters.domFacade.getFirstChildPointer(pointer, null)) {
			return sequenceFactory.singletonTrueSequence();
		}
		return sequenceFactory.singletonFalseSequence();
	});
};

function areSameNode(
	nodeA: ChildNodePointer,
	nodeB: ChildNodePointer,
	domFacade: DomFacade
): boolean {
	if (domFacade.getNodeType(nodeA) !== domFacade.getNodeType(nodeB)) {
		return false;
	}
	if (domFacade.getNodeType(nodeB) === NODE_TYPES.ELEMENT_NODE) {
		return (
			domFacade.getLocalName(nodeB as ElementNodePointer) ===
				domFacade.getLocalName(nodeA as ElementNodePointer) &&
			domFacade.getNamespaceURI(nodeB as ElementNodePointer) ===
				domFacade.getNamespaceURI(nodeA as ElementNodePointer)
		);
	}
	if (domFacade.getNodeType(nodeB) === NODE_TYPES.PROCESSING_INSTRUCTION_NODE) {
		return (
			domFacade.getTarget(nodeB as ProcessingInstructionNodePointer) ===
			domFacade.getTarget(nodeA as ProcessingInstructionNodePointer)
		);
	}

	return true;
}

const fnPath: FunctionDefinitionType = (
	_dynamicContext,
	executionParameters,
	_staticContext,
	nodeSequence: ISequence
) => {
	return zipSingleton([nodeSequence], ([pointerValue]: (Value | null)[]) => {
		if (pointerValue === null) {
			return sequenceFactory.empty();
		}

		const pointer: NodePointer = pointerValue.value;
		const domFacade: DomFacade = executionParameters.domFacade;

		let result = '';

		function getChildIndex(child: ChildNodePointer): number {
			let i = 0;
			let otherChild = child;
			while (otherChild !== null) {
				if (areSameNode(child, otherChild, domFacade)) {
					i++;
				}
				otherChild = domFacade.getPreviousSiblingPointer(otherChild, null);
			}
			return i;
		}
		let ancestor;
		for (
			ancestor = pointer;
			executionParameters.domFacade.getParentNodePointer(
				ancestor as ChildNodePointer,
				null
			) !== null;
			ancestor = executionParameters.domFacade.getParentNodePointer(
				ancestor as ChildNodePointer,
				null
			)
		) {
			switch (domFacade.getNodeType(ancestor)) {
				case NODE_TYPES.ELEMENT_NODE:
					result = `/Q{${
						domFacade.getNamespaceURI(ancestor) || ''
					}}${domFacade.getLocalName(ancestor)}[${getChildIndex(ancestor)}]${result}`;
					break;
				case NODE_TYPES.ATTRIBUTE_NODE:
					const attributeNameSpace = domFacade.getNamespaceURI(ancestor)
						? `Q{${domFacade.getNamespaceURI(ancestor)}}`
						: '';
					result = `/@${attributeNameSpace}${domFacade.getLocalName(ancestor)}${result}`;
					break;
				case NODE_TYPES.TEXT_NODE:
					result = `/text()[${getChildIndex(ancestor)}]${result}`;
					break;
				case NODE_TYPES.PROCESSING_INSTRUCTION_NODE:
					result = `/processing-instruction(${domFacade.getTarget(
						ancestor
					)})[${getChildIndex(ancestor)}]${result}`;
					break;
				case NODE_TYPES.COMMENT_NODE:
					result = `/comment()[${getChildIndex(ancestor)}]${result}`;
					break;
			}
		}
		if (domFacade.getNodeType(ancestor) === NODE_TYPES.DOCUMENT_NODE) {
			return sequenceFactory.create(createAtomicValue(result || '/', 'xs:string'));
		}
		result = 'Q{http://www.w3.org/2005/xpath-functions}root()' + result;
		return sequenceFactory.create(createAtomicValue(result, 'xs:string'));
	});
};

const fnNamespaceURI: FunctionDefinitionType = (
	_dynamicContext,
	executionParameters,
	_staticContext,
	sequence
) => {
	return sequence.map((node) =>
		createAtomicValue(
			executionParameters.domFacade.getNamespaceURI(node.value) || '',
			'xs:anyURI'
		)
	);
};

const fnLocalName: FunctionDefinitionType = (
	_dynamicContext,
	executionParameters,
	_staticContext,
	sequence
) => {
	const domFacade = executionParameters.domFacade;
	return sequence.switchCases({
		default: () => {
			return sequence.map((node) => {
				if (domFacade.getNodeType(node.value) === 7) {
					const pi: ProcessingInstructionNodePointer = node.value;
					return createAtomicValue(domFacade.getTarget(pi), 'xs:string');
				}

				return createAtomicValue(domFacade.getLocalName(node.value) || '', 'xs:string');
			});
		},
		empty: () => sequenceFactory.singleton(createAtomicValue('', 'xs:string')),
	});
};

function contains(domFacade: DomFacade, ancestor: NodePointer, descendant: NodePointer): boolean {
	if (domFacade.getNodeType(ancestor) === NODE_TYPES.ATTRIBUTE_NODE) {
		return arePointersEqual(ancestor, descendant);
	}
	while (descendant) {
		if (arePointersEqual(ancestor, descendant)) {
			return true;
		}
		if (domFacade.getNodeType(descendant) === NODE_TYPES.DOCUMENT_NODE) {
			return false;
		}
		descendant = domFacade.getParentNodePointer(descendant as ChildNodePointer, null);
	}
	return false;
}

const fnOutermost: FunctionDefinitionType = (
	_dynamicContext,
	executionParameters,
	_staticContext,
	nodeSequence
) => {
	return nodeSequence.mapAll((allNodeValues) => {
		if (!allNodeValues.length) {
			return sequenceFactory.empty();
		}

		const resultNodes = sortNodeValues(executionParameters.domFacade, allNodeValues).reduce(
			(previousNodes, node, i) => {
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

		return sequenceFactory.create(resultNodes);
	}, IterationHint.SKIP_DESCENDANTS);
};

const fnInnermost: FunctionDefinitionType = (
	_dynamicContext,
	executionParameters,
	_staticContext,
	nodeSequence
) => {
	return nodeSequence.mapAll((allNodeValues) => {
		if (!allNodeValues.length) {
			return sequenceFactory.empty();
		}

		const resultNodes = sortNodeValues(
			executionParameters.domFacade,
			allNodeValues
		).reduceRight((followingNodes, node, i, allNodes) => {
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

		return sequenceFactory.create(resultNodes);
	});
};

const fnRoot: FunctionDefinitionType = (
	_dynamicContext,
	executionParameters,
	_staticContext,
	nodeSequence
) => {
	return nodeSequence.map((node) => {
		if (!isSubtypeOf(node.type, 'node()')) {
			throw new Error('XPTY0004 Argument passed to fn:root() should be of the type node()');
		}

		let ancestor;
		let parent = node.value;
		while (parent) {
			ancestor = parent;
			parent = executionParameters.domFacade.getParentNodePointer(ancestor, null);
		}
		return createPointerValue(ancestor, executionParameters.domFacade);
	});
};

export default {
	declarations: [
		{
			argumentTypes: ['node()?'],
			callFunction: fnName,
			localName: 'name',
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			returnType: 'xs:string?',
		},

		{
			argumentTypes: [],
			callFunction: contextItemAsFirstArgument.bind(null, fnName),
			localName: 'name',
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			returnType: 'xs:string',
		},

		{
			argumentTypes: ['node()'],
			callFunction: fnNamespaceURI,
			localName: 'namespace-uri',
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			returnType: 'xs:anyURI',
		},

		{
			argumentTypes: [],
			callFunction: contextItemAsFirstArgument.bind(null, fnNamespaceURI),
			localName: 'namespace-uri',
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			returnType: 'xs:anyURI',
		},

		{
			argumentTypes: ['node()*'],
			callFunction: fnInnermost,
			localName: 'innermost',
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			returnType: 'node()*',
		},

		{
			argumentTypes: ['node()*'],
			callFunction: fnOutermost,
			localName: 'outermost',
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			returnType: 'node()*',
		},

		{
			argumentTypes: ['node()?'],
			callFunction: fnHasChildren,
			localName: 'has-children',
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			returnType: 'xs:boolean',
		},

		{
			argumentTypes: [],
			callFunction: contextItemAsFirstArgument.bind(null, fnHasChildren),
			localName: 'has-children',
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			returnType: 'xs:boolean',
		},

		{
			argumentTypes: ['node()?'],
			callFunction: fnPath,
			localName: 'path',
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			returnType: 'xs:string?',
		},

		{
			argumentTypes: [],
			callFunction: contextItemAsFirstArgument.bind(null, fnPath),
			localName: 'path',
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			returnType: 'xs:string?',
		},

		{
			argumentTypes: ['node()?'],
			callFunction: fnNodeName,
			localName: 'node-name',
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			returnType: 'xs:QName?',
		},

		{
			argumentTypes: [],
			callFunction: contextItemAsFirstArgument.bind(null, fnNodeName),
			localName: 'node-name',
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			returnType: 'xs:QName?',
		},

		{
			argumentTypes: ['node()?'],
			callFunction: fnLocalName,
			localName: 'local-name',
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			returnType: 'xs:string',
		},

		{
			argumentTypes: [],
			callFunction: contextItemAsFirstArgument.bind(null, fnLocalName),
			localName: 'local-name',
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			returnType: 'xs:string',
		},

		{
			argumentTypes: ['node()?'],
			callFunction: fnRoot,
			localName: 'root',
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			returnType: 'node()?',
		},

		{
			argumentTypes: [],
			callFunction: contextItemAsFirstArgument.bind(null, fnRoot),
			localName: 'root',
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			returnType: 'node()?',
		},

		{
			argumentTypes: [],
			callFunction: contextItemAsFirstArgument.bind(null, fnData),
			localName: 'data',
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			returnType: 'xs:anyAtomicType*',
		},
		{
			argumentTypes: ['item()*'],
			callFunction: fnData,
			localName: 'data',
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			returnType: 'xs:anyAtomicType*',
		},
	],
	functions: {
		name: fnName,
		nodeName: fnNodeName,
	},
};
