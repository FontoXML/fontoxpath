import {
	AttributeNodePointer,
	ChildNodePointer,
	CommentNodePointer,
	ElementNodePointer,
	NodePointer,
	ParentNodePointer,
	ProcessingInstructionNodePointer,
	TextNodePointer,
} from '../../domClone/Pointer';
import { NODE_TYPES } from '../../domFacade/ConcreteNode';
import DomFacade from '../../domFacade/DomFacade';
import atomize from '../dataTypes/atomize';
import createAtomicValue from '../dataTypes/createAtomicValue';
import createPointerValue from '../dataTypes/createPointerValue';
import { sortNodeValues } from '../dataTypes/documentOrderUtils';
import ISequence from '../dataTypes/ISequence';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import sequenceFactory from '../dataTypes/sequenceFactory';
import Value, { SequenceMultiplicity, ValueType } from '../dataTypes/Value';
import QName from '../dataTypes/valueTypes/QName';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import arePointersEqual from '../operators/compares/arePointersEqual';
import { BUILT_IN_NAMESPACE_URIS } from '../staticallyKnownNamespaces';
import StaticContext from '../StaticContext';
import { IterationHint } from '../util/iterators';
import zipSingleton from '../util/zipSingleton';
import { errXPDY0002 } from '../XPathErrors';
import { BuiltinDeclarationType } from './builtInFunctions';
import builtinStringFunctions from './builtInFunctions_string';
import FunctionDefinitionType from './FunctionDefinitionType';

const fnString = builtinStringFunctions.functions.string;

function contextItemAsFirstArgument(
	functionName: string,
	fn: FunctionDefinitionType,
	dynamicContext: DynamicContext,
	executionParameters: ExecutionParameters,
	staticContext: StaticContext,
) {
	if (dynamicContext.contextItem === null) {
		throw errXPDY0002(
			`The function ${functionName} depends on dynamic context, which is absent.`,
		);
	}
	return fn(
		dynamicContext,
		executionParameters,
		staticContext,
		sequenceFactory.singleton(dynamicContext.contextItem),
	);
}

const fnNodeName: FunctionDefinitionType = (
	_dynamicContext,
	executionParameters,
	_staticContext,
	sequence,
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
							domFacade.getPrefix(attrOrElPointer),
							domFacade.getNamespaceURI(attrOrElPointer),
							domFacade.getLocalName(attrOrElPointer),
						),
						ValueType.XSQNAME,
					),
				);
			case NODE_TYPES.PROCESSING_INSTRUCTION_NODE:
				// A processing instruction's target is its nodename (https://www.w3.org/TR/xpath-functions-31/#func-node-name)
				const processingInstruction = pointer as ProcessingInstructionNodePointer;
				return sequenceFactory.singleton(
					createAtomicValue(
						new QName('', '', domFacade.getTarget(processingInstruction)),
						ValueType.XSQNAME,
					),
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
	sequence,
) => {
	return sequence.switchCases({
		default: () =>
			fnString(
				dynamicContext,
				executionParameters,
				staticContext,
				fnNodeName(dynamicContext, executionParameters, staticContext, sequence),
			),
		empty: () => sequenceFactory.singleton(createAtomicValue('', ValueType.XSSTRING)),
	});
};

const fnData: FunctionDefinitionType = (
	_dynamicContext,
	executionParameters,
	_staticContext,
	sequence,
) => {
	return atomize(sequence, executionParameters);
};

const fnHasChildren: FunctionDefinitionType = (
	_dynamicContext,
	executionParameters,
	_staticContext,
	nodeSequence: ISequence,
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
	domFacade: DomFacade,
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
	nodeSequence: ISequence,
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
				null,
			) !== null;
			ancestor = executionParameters.domFacade.getParentNodePointer(
				ancestor as ChildNodePointer,
				null,
			)
		) {
			switch (domFacade.getNodeType(ancestor)) {
				case NODE_TYPES.ELEMENT_NODE: {
					const ancestorElement = ancestor as ElementNodePointer;
					result = `/Q{${
						domFacade.getNamespaceURI(ancestorElement) || ''
					}}${domFacade.getLocalName(ancestorElement)}[${getChildIndex(
						ancestorElement,
					)}]${result}`;
					break;
				}
				case NODE_TYPES.ATTRIBUTE_NODE: {
					const ancestorAttributeNode = ancestor as AttributeNodePointer;
					const attributeNameSpace = domFacade.getNamespaceURI(ancestorAttributeNode)
						? `Q{${domFacade.getNamespaceURI(ancestorAttributeNode)}}`
						: '';
					result = `/@${attributeNameSpace}${domFacade.getLocalName(
						ancestorAttributeNode,
					)}${result}`;
					break;
				}
				case NODE_TYPES.TEXT_NODE: {
					const ancestorTextNode = ancestor as TextNodePointer;
					result = `/text()[${getChildIndex(ancestorTextNode)}]${result}`;
					break;
				}
				case NODE_TYPES.PROCESSING_INSTRUCTION_NODE: {
					const ancestorPI = ancestor as ProcessingInstructionNodePointer;
					result = `/processing-instruction(${domFacade.getTarget(
						ancestorPI,
					)})[${getChildIndex(ancestorPI)}]${result}`;
					break;
				}
				case NODE_TYPES.COMMENT_NODE: {
					const ancestorComment = ancestor as CommentNodePointer;
					result = `/comment()[${getChildIndex(ancestorComment)}]${result}`;
					break;
				}
			}
		}
		if (domFacade.getNodeType(ancestor) === NODE_TYPES.DOCUMENT_NODE) {
			return sequenceFactory.create(createAtomicValue(result || '/', ValueType.XSSTRING));
		}
		result = 'Q{http://www.w3.org/2005/xpath-functions}root()' + result;
		return sequenceFactory.create(createAtomicValue(result, ValueType.XSSTRING));
	});
};

const fnNamespaceURI: FunctionDefinitionType = (
	_dynamicContext,
	executionParameters,
	_staticContext,
	sequence,
) => {
	return sequence.map((node) =>
		createAtomicValue(
			executionParameters.domFacade.getNamespaceURI(node.value) || '',
			ValueType.XSANYURI,
		),
	);
};

const fnLocalName: FunctionDefinitionType = (
	_dynamicContext,
	executionParameters,
	_staticContext,
	sequence,
) => {
	const domFacade = executionParameters.domFacade;
	return sequence.switchCases({
		default: () => {
			return sequence.map((node) => {
				if (domFacade.getNodeType(node.value) === 7) {
					const pi: ProcessingInstructionNodePointer = node.value;
					return createAtomicValue(domFacade.getTarget(pi), ValueType.XSSTRING);
				}

				return createAtomicValue(
					domFacade.getLocalName(node.value) || '',
					ValueType.XSSTRING,
				);
			});
		},
		empty: () => sequenceFactory.singleton(createAtomicValue('', ValueType.XSSTRING)),
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
	nodeSequence,
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
						node.value,
					)
				) {
					// The previous node is an ancestor
					return previousNodes;
				}

				previousNodes.push(node);
				return previousNodes;
			},
			[],
		);

		return sequenceFactory.create(resultNodes);
	}, IterationHint.SKIP_DESCENDANTS);
};

const fnInnermost: FunctionDefinitionType = (
	_dynamicContext,
	executionParameters,
	_staticContext,
	nodeSequence,
) => {
	return nodeSequence.mapAll((allNodeValues) => {
		if (!allNodeValues.length) {
			return sequenceFactory.empty();
		}

		const resultNodes = sortNodeValues(
			executionParameters.domFacade,
			allNodeValues,
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
	nodeSequence,
) => {
	return nodeSequence.map((node) => {
		if (!isSubtypeOf(node.type, ValueType.NODE)) {
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

const declarations: BuiltinDeclarationType[] = [
	{
		argumentTypes: [{ type: ValueType.NODE, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		callFunction: fnName,
		localName: 'name',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
	},

	{
		argumentTypes: [],
		callFunction: contextItemAsFirstArgument.bind(null, 'name', fnName),
		localName: 'name',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
	},

	{
		argumentTypes: [{ type: ValueType.NODE, mult: SequenceMultiplicity.EXACTLY_ONE }],
		callFunction: fnNamespaceURI,
		localName: 'namespace-uri',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.XSANYURI, mult: SequenceMultiplicity.EXACTLY_ONE },
	},

	{
		argumentTypes: [],
		callFunction: contextItemAsFirstArgument.bind(null, 'namespace-uri', fnNamespaceURI),
		localName: 'namespace-uri',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.XSANYURI, mult: SequenceMultiplicity.EXACTLY_ONE },
	},

	{
		argumentTypes: [{ type: ValueType.NODE, mult: SequenceMultiplicity.ZERO_OR_MORE }],
		callFunction: fnInnermost,
		localName: 'innermost',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.NODE, mult: SequenceMultiplicity.ZERO_OR_MORE },
	},

	{
		argumentTypes: [{ type: ValueType.NODE, mult: SequenceMultiplicity.ZERO_OR_MORE }],
		callFunction: fnOutermost,
		localName: 'outermost',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.NODE, mult: SequenceMultiplicity.ZERO_OR_MORE },
	},

	{
		argumentTypes: [{ type: ValueType.NODE, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		callFunction: fnHasChildren,
		localName: 'has-children',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: {
			type: ValueType.XSBOOLEAN,
			mult: SequenceMultiplicity.EXACTLY_ONE,
		},
	},

	{
		argumentTypes: [],
		callFunction: contextItemAsFirstArgument.bind(null, 'has-children', fnHasChildren),
		localName: 'has-children',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.XSBOOLEAN, mult: SequenceMultiplicity.EXACTLY_ONE },
	},

	{
		argumentTypes: [{ type: ValueType.NODE, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		callFunction: fnPath,
		localName: 'path',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE },
	},

	{
		argumentTypes: [],
		callFunction: contextItemAsFirstArgument.bind(null, 'path', fnPath),
		localName: 'path',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE },
	},

	{
		argumentTypes: [{ type: ValueType.NODE, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		callFunction: fnNodeName,
		localName: 'node-name',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.XSQNAME, mult: SequenceMultiplicity.ZERO_OR_ONE },
	},

	{
		argumentTypes: [],
		callFunction: contextItemAsFirstArgument.bind(null, 'node-name', fnNodeName),
		localName: 'node-name',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.XSQNAME, mult: SequenceMultiplicity.ZERO_OR_ONE },
	},

	{
		argumentTypes: [{ type: ValueType.NODE, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		callFunction: fnLocalName,
		localName: 'local-name',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
	},

	{
		argumentTypes: [],
		callFunction: contextItemAsFirstArgument.bind(null, 'local-name', fnLocalName),
		localName: 'local-name',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
	},

	{
		argumentTypes: [{ type: ValueType.NODE, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		callFunction: fnRoot,
		localName: 'root',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.NODE, mult: SequenceMultiplicity.ZERO_OR_ONE },
	},

	{
		argumentTypes: [],
		callFunction: contextItemAsFirstArgument.bind(null, 'root', fnRoot),
		localName: 'root',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.NODE, mult: SequenceMultiplicity.ZERO_OR_ONE },
	},

	{
		argumentTypes: [],
		callFunction: contextItemAsFirstArgument.bind(null, 'data', fnData),
		localName: 'data',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_MORE },
	},
	{
		argumentTypes: [{ type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE }],
		callFunction: fnData,
		localName: 'data',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_MORE },
	},
];

export default {
	declarations,
	functions: {
		name: fnName,
		nodeName: fnNodeName,
	},
};
