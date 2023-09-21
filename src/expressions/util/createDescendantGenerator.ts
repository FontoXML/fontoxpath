import { ChildNodePointer, NodePointer, ParentNodePointer } from '../../domClone/Pointer';
import { NODE_TYPES } from '../../domFacade/ConcreteNode';
import DomFacade from '../../domFacade/DomFacade';
import createPointerValue from '../dataTypes/createPointerValue';
import arePointersEqual from '../operators/compares/arePointersEqual';
import { Bucket } from './Bucket';
import createChildGenerator from './createChildGenerator';
import { DONE_TOKEN, IterationHint, ready } from './iterators';

function findDeepestLastDescendant(
	pointer: NodePointer,
	domFacade: DomFacade,
	bucket: Bucket | null,
): NodePointer {
	const nodeType = domFacade.getNodeType(pointer);
	if (nodeType !== NODE_TYPES.ELEMENT_NODE && nodeType !== NODE_TYPES.DOCUMENT_NODE) {
		return pointer;
	}

	let parentNode = pointer as ParentNodePointer;
	let childNode = domFacade.getLastChildPointer(parentNode, bucket);
	while (childNode !== null) {
		if (domFacade.getNodeType(childNode) !== NODE_TYPES.ELEMENT_NODE) {
			return childNode;
		}
		parentNode = childNode as ParentNodePointer;
		childNode = domFacade.getLastChildPointer(parentNode, bucket);
	}
	return parentNode;
}

export default function createDescendantGenerator(
	domFacade: DomFacade,
	pointer: NodePointer,
	returnInReverse = false,
	bucket: Bucket | null,
) {
	if (returnInReverse) {
		let currentPointer: NodePointer = pointer;
		let isDone = false;
		return {
			next: () => {
				if (isDone) {
					return DONE_TOKEN;
				}

				if (arePointersEqual(currentPointer, pointer)) {
					currentPointer = findDeepestLastDescendant(pointer, domFacade, bucket);
					if (arePointersEqual(currentPointer, pointer)) {
						isDone = true;
						return DONE_TOKEN;
					}
					return ready(createPointerValue(currentPointer, domFacade));
				}

				const nodeType = domFacade.getNodeType(currentPointer);
				const previousSibling =
					nodeType === NODE_TYPES.DOCUMENT_NODE || nodeType === NODE_TYPES.ATTRIBUTE_NODE
						? null
						: domFacade.getPreviousSiblingPointer(
								currentPointer as ChildNodePointer,
								bucket,
						  );
				if (previousSibling !== null) {
					currentPointer = findDeepestLastDescendant(previousSibling, domFacade, bucket);
					return ready(createPointerValue(currentPointer, domFacade));
				}

				currentPointer =
					nodeType === NODE_TYPES.DOCUMENT_NODE
						? null
						: domFacade.getParentNodePointer(
								currentPointer as ChildNodePointer,
								bucket,
						  );
				if (arePointersEqual(currentPointer, pointer)) {
					isDone = true;
					return DONE_TOKEN;
				}
				return ready(createPointerValue(currentPointer, domFacade));
			},
		};
	}

	const descendantIteratorStack = [createChildGenerator(domFacade, pointer, bucket)];
	return {
		next: () => {
			if (!descendantIteratorStack.length) {
				return DONE_TOKEN;
			}
			let value = descendantIteratorStack[0].next(IterationHint.NONE);
			while (value.done) {
				descendantIteratorStack.shift();
				if (!descendantIteratorStack.length) {
					return DONE_TOKEN;
				}
				value = descendantIteratorStack[0].next(IterationHint.NONE);
			}
			// Iterator over these children next
			descendantIteratorStack.unshift(createChildGenerator(domFacade, value.value, bucket));
			return ready(createPointerValue(value.value, domFacade));
		},
	};
}
