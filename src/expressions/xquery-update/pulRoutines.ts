import {
	deletePu,
	insertAfter,
	insertBefore,
	insertInto,
	insertIntoAsFirst,
	insertIntoAsLast,
	insertAttributes,
	rename,
	replaceElementContent,
	replaceNode,
	replaceValue
} from './applyPulPrimitives';
import { errXUDY0015, errXUDY0016, errXUDY0017, errXUDY0024 } from './XQueryUpdateFacilityErrors';
import QName from '../dataTypes/valueTypes/QName';
import { PendingUpdate, ReplaceNodePendingUpdate, RenamePendingUpdate } from './PendingUpdate';
import { NODE_TYPES } from 'src/domFacade/ConcreteNode';

export const applyUpdates = function(
	pul,
	_revalidationModule,
	_inheritNamespaces,
	domFacade,
	nodesFactory,
	documentWriter
) {
	// 1. Checks the update primitives on $pul for compatibility using upd:compatibilityCheck.
	compatibilityCheck(pul, domFacade);

	// 2. The semantics of all update primitives on $pul, other than upd:put primitives, are made effective in the following order:
	// a. First, all upd:insertInto, upd:insertAttributes, upd:replaceValue, and upd:rename primitives are applied.
	pul.filter(
		pu => ['insertInto', 'insertAttributes', 'replaceValue', 'rename'].indexOf(pu.type) !== -1
	).forEach(pu => {
		switch (pu.type) {
			case 'insertInto':
				insertInto(pu.target, pu.content, documentWriter);
				break;
			case 'insertAttributes':
				insertAttributes(pu.target, pu.content, domFacade, documentWriter);
				break;
			case 'rename':
				rename(pu.target, pu.newName, domFacade, nodesFactory, documentWriter);
				break;
			case 'replaceValue':
				replaceValue(pu.target, pu.stringValue, domFacade, documentWriter);
				break;
		}
	});

	// b. Next, all upd:insertBefore, upd:insertAfter, upd:insertIntoAsFirst, and upd:insertIntoAsLast primitives are applied.
	pul.filter(
		pu =>
			['insertBefore', 'insertAfter', 'insertIntoAsFirst', 'insertIntoAsLast'].indexOf(
				pu.type
			) !== -1
	).forEach(pu => {
		switch (pu.type) {
			case 'insertAfter':
				insertAfter(pu.target, pu.content, domFacade, documentWriter);
				break;
			case 'insertBefore':
				insertBefore(pu.target, pu.content, domFacade, documentWriter);
				break;
			case 'insertIntoAsFirst':
				insertIntoAsFirst(pu.target, pu.content, domFacade, documentWriter);
				break;
			case 'insertIntoAsLast':
				insertIntoAsLast(pu.target, pu.content, documentWriter);
				break;
		}
	});

	// c. Next, all upd:replaceNode primitives are applied.
	pul.filter(pu => pu.type === 'replaceNode').forEach(pu => {
		replaceNode(pu.target, pu.replacement, domFacade, documentWriter);
	});

	// d. Next, all upd:replaceElementContent primitives are applied.
	pul.filter(pu => pu.type === 'replaceElementContent').forEach(pu => {
		replaceElementContent(pu.target, pu.text, domFacade, documentWriter);
	});

	// e. Next, all upd:delete primitives are applied.
	pul.filter(pu => pu.type === 'delete').forEach(pu => {
		deletePu(pu.target, domFacade, documentWriter);
	});

	// Point 3. to 7. are either not necessary or should be done by the caller.

	// 8. As the final step, all upd:put primitives on $pul are applied.
	if (pul.some(pu => pu.type === 'put')) {
		throw new Error(
			'Not implemented: the execution for pendingUpdate "put" is not yet implemented.'
		);
	}
};

const compatibilityCheck = function(pul: PendingUpdate[], domFacade) {
	function findDuplicateTargets(type, onFoundDuplicate) {
		const targets = new Set();
		pul.filter(pu => pu.type === type)
			.map(pu => pu.target)
			.forEach(target => {
				if (targets.has(target)) {
					onFoundDuplicate(target);
				}
				targets.add(target);
			});
	}

	// A dynamic error if any of the following conditions are detected:

	// 1. Two or more upd:rename primitives in $pul have the same target node [err:XUDY0015].
	findDuplicateTargets('rename', target => {
		throw errXUDY0015(target);
	});

	// 2. Two or more upd:replaceNode primitives in $pul have the same target node [err:XUDY0016].
	findDuplicateTargets('replaceNode', target => {
		throw errXUDY0016(target);
	});

	// 3. Two or more upd:replaceValue primitives in $pul have the same target node [err:XUDY0017].
	findDuplicateTargets('replaceValue', target => {
		throw errXUDY0017(target);
	});

	// 4. Two or more upd:replaceElementContent primitives in $pul have the same target node [err:XUDY0017].
	findDuplicateTargets('replaceElementContent', target => {
		throw errXUDY0017(target);
	});

	// 5. Two or more upd:put primitives in $pul have the same $uri operand [err:XUDY0031].

	// 6. Two or more primitives in $pul create conflicting namespace bindings for the same element node [err:XUDY0024].
	// The following kinds of primitives create namespace bindings:
	const newQNamesByElement = new Map();
	const getAttributeName = attribute =>
		new QName(attribute.prefix, attribute.namespaceURI, attribute.localName);
	// a. upd:insertAttributes creates one namespace binding on the $target element corresponding to
	//    the implied namespace binding of the name of each attribute node in $content.
	// b. upd:replaceNode creates one namespace binding on the $target element corresponding to the
	//    implied namespace binding of the name of each attribute node in $replacement.
	pul.filter(
		pu => pu.type === 'replaceNode' && pu.target.nodeType === NODE_TYPES.ATTRIBUTE_NODE
	).forEach((pu: ReplaceNodePendingUpdate) => {
		const element = domFacade.getParentNode(pu.target);
		const qNames = newQNamesByElement.get(element);
		if (qNames) {
			qNames.push(...pu.replacement.map(getAttributeName));
		} else {
			newQNamesByElement.set(element, pu.replacement.map(getAttributeName));
		}
	});
	// c. upd:rename creates a namespace binding on $target, or on the parent (if any) of $target if
	//    $target is an attribute node, corresponding to the implied namespace binding of $newName.
	pul.filter(
		pu => pu.type === 'rename' && pu.target.nodeType === NODE_TYPES.ATTRIBUTE_NODE
	).forEach((pu: RenamePendingUpdate) => {
		const element = domFacade.getParentNode(pu.target);
		if (!element) {
			return;
		}
		const qNames = newQNamesByElement.get(element);
		if (qNames) {
			qNames.push(pu.newName);
		} else {
			newQNamesByElement.set(element, [pu.newName]);
		}
	});

	newQNamesByElement.forEach((qNames, _element) => {
		const prefixes = {};
		qNames.forEach(qName => {
			if (!prefixes[qName.prefix]) {
				prefixes[qName.prefix] = qName.namespaceURI;
			}
			if (prefixes[qName.prefix] !== qName.namespaceURI) {
				throw errXUDY0024(qName.namespaceURI);
			}
		});
	});
};

export const mergeUpdates = function(pul1, ...puls) {
	return pul1.concat(...puls.filter(Boolean));
};
