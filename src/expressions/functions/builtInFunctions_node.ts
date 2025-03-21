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
import arePointersEqual from '../operators/compares/arePointersEqual';
import { BUILT_IN_NAMESPACE_URIS } from '../staticallyKnownNamespaces';
import { IterationHint } from '../util/iterators';
import zipSingleton from '../util/zipSingleton';
import { errXPDY0002 } from '../XPathErrors';
import { contextItemAsFirstArgument } from './argumentHelper';
import { BuiltinDeclarationType } from './builtInFunctions';
import builtinStringFunctions from './builtInFunctions_string';
import FunctionDefinitionType from './FunctionDefinitionType';
import generateId from './generateId';
const fnString = builtinStringFunctions.functions.string;

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

const fnGenerateId: FunctionDefinitionType = (
	dynamicContext,
	executionParameters,
	_staticContext,
	nodeValue,
) => {
	if (nodeValue.isEmpty()) {
		return sequenceFactory.singleton(createAtomicValue('', ValueType.XSSTRING));
	}
	if (!isSubtypeOf(nodeValue.first().type, ValueType.NODE)) {
		throw new Error('XPTY0004: The context item must be a node.');
	}
	const node = nodeValue.first().value as NodePointer;

	return sequenceFactory.singleton(createAtomicValue(generateId(node), ValueType.XSSTRING));
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

/**
 * Test if a string should match the xml:lang attribute string of a node.
 */
function langMatchString(truth: string, test: string): boolean {
	truth = truth.toLowerCase();
	test = test.toLowerCase();
	if (truth === test) {
		return true;
	} else {
		return truth.length < 5 || !truth.startsWith(test)
			? false
			: /* Strip the least specific part and test again */
			  langMatchString(truth.replace(/-[a-z0-9]+$/, ''), test);
	}
}

/**
 * Starting at a given node, test the xml:lang attribute to see if it
   matches a test. Move up the tree until the test passes or fails.
 */
function langMatchNode(node: NodePointer, domFacade: DomFacade, test: string): ISequence {
	let toTest = node;
	while (toTest) {
		if (domFacade.getNodeType(toTest) !== NODE_TYPES.ELEMENT_NODE) {
			toTest = domFacade.getParentNodePointer(toTest as AttributeNodePointer);
		} else if (domFacade.getNodeType(toTest) === NODE_TYPES.ELEMENT_NODE) {
			const attrValue = domFacade.getAttribute(toTest as ElementNodePointer, 'xml:lang');
			if (attrValue) {
				return langMatchString(attrValue, test)
					? sequenceFactory.singletonTrueSequence()
					: sequenceFactory.singletonFalseSequence();
			} else {
				toTest = domFacade.getParentNodePointer(toTest as ElementNodePointer);
			}
		}
	}
	return sequenceFactory.singletonFalseSequence();
}

const fnLang: FunctionDefinitionType = (
	dynamicContext,
	executionParameters,
	_staticContext,
	langTestValue,
	nodeValue,
) => {
	const domFacade = executionParameters.domFacade;
	let langTest;
	if (langTestValue.isEmpty()) {
		langTest = '';
	} else if (!isSubtypeOf(langTestValue.first().type, ValueType.XSSTRING)) {
		throw new Error('XPTY0004: The first argument of lang must be a string.');
	} else {
		langTest = langTestValue.first().value;
	}
	let node;
	if (!nodeValue) {
		if (!dynamicContext || !dynamicContext.contextItem) {
			throw errXPDY0002(
				`The function lang depends on dynamic context if a node is not passed as the second argument.`,
			);
		}
		if (!isSubtypeOf(dynamicContext.contextItem.type, ValueType.NODE)) {
			throw new Error('XPTY0004: The context item must be a node.');
		}
		node = dynamicContext.contextItem.value;
	} else {
		node = nodeValue.first().value;
	}
	return langMatchNode(node, domFacade, langTest);
};

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
		callFunction: contextItemAsFirstArgument('name', ValueType.NODE, fnName),
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
		callFunction: contextItemAsFirstArgument('namespace-uri', ValueType.NODE, fnNamespaceURI),
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
		callFunction: contextItemAsFirstArgument('has-children', ValueType.NODE, fnHasChildren),
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
		callFunction: contextItemAsFirstArgument('path', ValueType.NODE, fnPath),
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
		callFunction: contextItemAsFirstArgument('node-name', ValueType.NODE, fnNodeName),
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
		callFunction: contextItemAsFirstArgument('local-name', ValueType.NODE, fnLocalName),
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
		callFunction: contextItemAsFirstArgument('root', ValueType.NODE, fnRoot),
		localName: 'root',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.NODE, mult: SequenceMultiplicity.ZERO_OR_ONE },
	},

	{
		argumentTypes: [],
		callFunction: contextItemAsFirstArgument('data', ValueType.ITEM, fnData),
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

	{
		argumentTypes: [{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		callFunction: fnLang,
		localName: 'lang',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.XSBOOLEAN, mult: SequenceMultiplicity.EXACTLY_ONE },
	},
	{
		argumentTypes: [
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE },
			{ type: ValueType.NODE, mult: SequenceMultiplicity.EXACTLY_ONE },
		],
		callFunction: fnLang,
		localName: 'lang',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.XSBOOLEAN, mult: SequenceMultiplicity.EXACTLY_ONE },
	},
	{
		argumentTypes: [],
		callFunction: contextItemAsFirstArgument('generate-id', ValueType.NODE, fnGenerateId),
		localName: 'generate-id',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
	},
	{
		argumentTypes: [{ type: ValueType.NODE, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		callFunction: fnGenerateId,
		localName: 'generate-id',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
	},
];

export default {
	declarations,
	functions: {
		name: fnName,
		nodeName: fnNodeName,
	},
};
