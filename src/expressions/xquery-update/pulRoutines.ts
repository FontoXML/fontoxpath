import DomFacade from '../../domFacade/DomFacade';
import IDocumentWriter from '../../documentWriter/IDocumentWriter';
import { NODE_TYPES } from '../../domFacade/ConcreteNode';
import INodesFactory from '../../nodesFactory/INodesFactory';
import QName from '../dataTypes/valueTypes/QName';
import {
	deletePu,
	insertAfter,
	insertAttributes,
	insertBefore,
	insertInto,
	insertIntoAsFirst,
	insertIntoAsLast,
	rename,
	replaceElementContent,
	replaceNode,
	replaceValue,
} from './applyPulPrimitives';
import { IPendingUpdate } from './IPendingUpdate';
import { DeletePendingUpdate } from './pendingUpdates/DeletePendingUpdate';
import { InsertAfterPendingUpdate } from './pendingUpdates/InsertAfterPendingUpdate';
import { InsertAttributesPendingUpdate } from './pendingUpdates/InsertAttributesPendingUpdate';
import { InsertBeforePendingUpdate } from './pendingUpdates/InsertBeforePendingUpdate';
import { InsertIntoAsFirstPendingUpdate } from './pendingUpdates/InsertIntoAsFirstPendingUpdate';
import { InsertIntoAsLastPendingUpdate } from './pendingUpdates/InsertIntoAsLastPendingUpdate';
import { InsertIntoPendingUpdate } from './pendingUpdates/InsertIntoPendingUpdate';
import { RenamePendingUpdate } from './pendingUpdates/RenamePendingUpdate';
import { ReplaceElementContentPendingUpdate } from './pendingUpdates/ReplaceElementContentPendingUpdate';
import { ReplaceNodePendingUpdate } from './pendingUpdates/ReplaceNodePendingUpdate';
import { ReplaceValuePendingUpdate } from './pendingUpdates/ReplaceValuePendingUpdate';
import { errXUDY0015, errXUDY0016, errXUDY0017, errXUDY0024 } from './XQueryUpdateFacilityErrors';

export const applyUpdates = (
	pul: IPendingUpdate[],
	_revalidationModule,
	_inheritNamespaces,
	domFacade: DomFacade,
	nodesFactory: INodesFactory,
	documentWriter: IDocumentWriter
) => {
	// 1. Checks the update primitives on $pul for compatibility using upd:compatibilityCheck.
	compatibilityCheck(pul, domFacade);

	// 2. The semantics of all update primitives on $pul, other than upd:put primitives, are made effective in the following order:
	// a. First, all upd:insertInto, upd:insertAttributes, upd:replaceValue, and upd:rename primitives are applied.
	pul.filter(
		(pu) => ['insertInto', 'insertAttributes', 'replaceValue', 'rename'].indexOf(pu.type) !== -1
	).forEach((pu) => {
		switch (pu.type) {
			case 'insertInto':
				const insertPu = pu as InsertIntoPendingUpdate;
				insertInto(insertPu.target, insertPu.content, documentWriter);
				break;
			case 'insertAttributes':
				const insertAttributesPu = pu as InsertAttributesPendingUpdate;
				insertAttributes(
					insertAttributesPu.target,
					insertAttributesPu.content,
					domFacade,
					documentWriter
				);
				break;
			case 'rename':
				const renamePu = pu as RenamePendingUpdate;
				rename(renamePu.target, renamePu.newName, domFacade, nodesFactory, documentWriter);
				break;
			case 'replaceValue':
				const replaceValuePu = pu as ReplaceValuePendingUpdate;
				replaceValue(
					replaceValuePu.target,
					replaceValuePu.stringValue,
					domFacade,
					documentWriter
				);
				break;
		}
	});

	// b. Next, all upd:insertBefore, upd:insertAfter, upd:insertIntoAsFirst, and upd:insertIntoAsLast primitives are applied.
	pul.filter(
		(pu) =>
			['insertBefore', 'insertAfter', 'insertIntoAsFirst', 'insertIntoAsLast'].indexOf(
				pu.type
			) !== -1
	).forEach((pu) => {
		switch (pu.type) {
			case 'insertAfter':
				const insertAfterPu = pu as InsertAfterPendingUpdate;
				insertAfter(insertAfterPu.target, insertAfterPu.content, domFacade, documentWriter);
				break;
			case 'insertBefore':
				const insertBeforePu = pu as InsertBeforePendingUpdate;
				insertBefore(
					insertBeforePu.target,
					insertBeforePu.content,
					domFacade,
					documentWriter
				);
				break;
			case 'insertIntoAsFirst':
				const insertAsFirstPu = pu as InsertIntoAsFirstPendingUpdate;
				insertIntoAsFirst(
					insertAsFirstPu.target,
					insertAsFirstPu.content,
					domFacade,
					documentWriter
				);
				break;
			case 'insertIntoAsLast':
				const insertAsLastPu = pu as InsertIntoAsLastPendingUpdate;
				insertIntoAsLast(insertAsLastPu.target, insertAsLastPu.content, documentWriter);
				break;
		}
	});

	// c. Next, all upd:replaceNode primitives are applied.
	pul.filter((pu) => pu.type === 'replaceNode').forEach((pu) => {
		const replacePu = pu as ReplaceNodePendingUpdate;
		replaceNode(replacePu.target, replacePu.replacement, domFacade, documentWriter);
	});

	// d. Next, all upd:replaceElementContent primitives are applied.
	pul.filter((pu) => pu.type === 'replaceElementContent').forEach((pu) => {
		const replacePu = pu as ReplaceElementContentPendingUpdate;
		replaceElementContent(replacePu.target, replacePu.text, domFacade, documentWriter);
	});

	// e. Next, all upd:delete primitives are applied.
	pul.filter((pu) => pu.type === 'delete').forEach((pu) => {
		const deletePendingUpdate = pu as DeletePendingUpdate;
		deletePu(deletePendingUpdate.target, domFacade, documentWriter);
	});

	// Point 3. to 7. are either not necessary or should be done by the caller.

	// 8. As the final step, all upd:put primitives on $pul are applied.
	if (pul.some((pu) => pu.type === 'put')) {
		throw new Error(
			'Not implemented: the execution for pendingUpdate "put" is not yet implemented.'
		);
	}
};

const compatibilityCheck = (pul: IPendingUpdate[], domFacade: DomFacade) => {
	function findDuplicateTargets(type, onFoundDuplicate) {
		const targets = new Set();
		pul.filter((pu) => pu.type === type)
			.map((pu) => pu.target)
			.forEach((target) => {
				const targetNode = target ? target.node : null;
				if (targets.has(targetNode)) {
					onFoundDuplicate(targetNode);
				}
				targets.add(targetNode);
			});
	}

	// A dynamic error if any of the following conditions are detected:

	// 1. Two or more upd:rename primitives in $pul have the same target node [err:XUDY0015].
	findDuplicateTargets('rename', (target) => {
		throw errXUDY0015(target);
	});

	// 2. Two or more upd:replaceNode primitives in $pul have the same target node [err:XUDY0016].
	findDuplicateTargets('replaceNode', (target) => {
		throw errXUDY0016(target);
	});

	// 3. Two or more upd:replaceValue primitives in $pul have the same target node [err:XUDY0017].
	findDuplicateTargets('replaceValue', (target) => {
		throw errXUDY0017(target);
	});

	// 4. Two or more upd:replaceElementContent primitives in $pul have the same target node [err:XUDY0017].
	findDuplicateTargets('replaceElementContent', (target) => {
		throw errXUDY0017(target);
	});

	// 5. Two or more upd:put primitives in $pul have the same $uri operand [err:XUDY0031].

	// 6. Two or more primitives in $pul create conflicting namespace bindings for the same element node [err:XUDY0024].
	// The following kinds of primitives create namespace bindings:
	const newQNamesByElement = new Map();
	const getAttributeName = (attribute) =>
		new QName(
			domFacade.getPrefix(attribute),
			domFacade.getNamespaceURI(attribute),
			domFacade.getLocalName(attribute)
		);
	// a. upd:insertAttributes creates one namespace binding on the $target element corresponding to
	//    the implied namespace binding of the name of each attribute node in $content.
	// b. upd:replaceNode creates one namespace binding on the $target element corresponding to the
	//    implied namespace binding of the name of each attribute node in $replacement.
	pul.filter(
		(pu) =>
			pu.type === 'replaceNode' &&
			domFacade.getNodeType(pu.target) === NODE_TYPES.ATTRIBUTE_NODE
	).forEach((pu: ReplaceNodePendingUpdate) => {
		const elementPointer = domFacade.getParentNodePointer(pu.target);
		const element = elementPointer ? elementPointer.node : null;
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
		(pu) =>
			pu.type === 'rename' && domFacade.getNodeType(pu.target) === NODE_TYPES.ATTRIBUTE_NODE
	).forEach((pu: RenamePendingUpdate) => {
		const elementPointer = domFacade.getParentNodePointer(pu.target);
		if (!elementPointer) {
			return;
		}
		const element = elementPointer.node;
		const qNames = newQNamesByElement.get(element);
		if (qNames) {
			qNames.push(pu.newName);
		} else {
			newQNamesByElement.set(element, [pu.newName]);
		}
	});

	newQNamesByElement.forEach((qNames, _element) => {
		const prefixes = {};
		qNames.forEach((qName) => {
			if (!prefixes[qName.prefix]) {
				prefixes[qName.prefix] = qName.namespaceURI;
			}
			if (prefixes[qName.prefix] !== qName.namespaceURI) {
				throw errXUDY0024(qName.namespaceURI);
			}
		});
	});
};

export const mergeUpdates = (pul1: IPendingUpdate[], ...puls: IPendingUpdate[][]) => {
	return pul1.concat(...puls.filter(Boolean));
};
