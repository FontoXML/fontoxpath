import {
	replaceElementContent,
	replaceNode,
	replaceValue
} from './applyPulPrimitives';
import {
	errXUDY0016,
	errXUDY0017,
	errXUDY0024
} from './XQueryUpdateFacilityErrors';

export const applyUpdates = function (pul, _revalidationModule, _inheritNamespaces, domFacade, documentWriter) {
	// 1. Checks the update primitives on $pul for compatibility using upd:compatibilityCheck.
	compatibilityCheck(pul, domFacade);

	// 2. The semantics of all update primitives on $pul, other than upd:put primitives, are made effective in the following order:
	// a. First, all upd:insertInto, upd:insertAttributes, upd:replaceValue, and upd:rename primitives are applied.
	pul.filter(pu => ['insertInto', 'insertAttributes', 'replaceValue', 'rename'].indexOf(pu.type) !== -1).forEach(pu => {
		switch (pu.type) {
			case 'replaceValue': {
				replaceValue(pu.target, pu.stringValue);
				break;
			}
			default:
				throw new Error('Not implemented: the execution for pendingUpdate ' + pu.type + ' is not yet implemented.');
		}
	});

	// b. Next, all upd:insertBefore, upd:insertAfter, upd:insertIntoAsFirst, and upd:insertIntoAsLast primitives are applied.
	pul.filter(pu => ['insertBefore', 'insertAfter', 'insertIntoAsFirst', 'insertIntoAsLast'].indexOf(pu.type) !== -1).forEach(pu => {
		throw new Error('Not implemented: the execution for pendingUpdate ' + pu.type + ' is not yet implemented.');
	});

	// c. Next, all upd:replaceNode primitives are applied.
	pul.filter(pu => pu.type === 'replaceNode').forEach(pu => {
		replaceNode(pu.target, pu.replacement, domFacade, documentWriter);
	});

	// d. Next, all upd:replaceElementContent primitives are applied.
	pul.filter(pu => pu.type === 'replaceElementContent').forEach(pu => {
		replaceElementContent(pu.target, pu.text);
	});

	// e. Next, all upd:delete primitives are applied.
	pul.filter(pu => pu.type === 'delete').forEach(pu => {
		throw new Error('Not implemented: the execution for pendingUpdate ' + pu.type + ' is not yet implemented.');
	});
};

const compatibilityCheck = function (pul, domFacade) {
	function findDuplicateTargets (type, onFoundDuplicate) {
		const targets = new Set();
		pul.filter(pu => pu.type === type).map(pu => pu.target).forEach(target => {
			if (targets.has(target)) {
				onFoundDuplicate(target);
			}
			targets.add(target);
		});
	}

	// A dynamic error if any of the following conditions are detected:

	// 1. Two or more upd:rename primitives in $pul have the same target node [err:XUDY0015].

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

	// 6. Two or more primitives in $pul create conflicting namespace bindings for the same element node [err:XUDY0024]. The following kinds of primitives create namespace bindings:
	// a. upd:insertAttributes creates one namespace binding on the $target element corresponding to the implied namespace binding of the name of each attribute node in $content.
	// b. upd:replaceNode creates one namespace binding on the $target element corresponding to the implied namespace binding of the name of each attribute node in $replacement.
	const map = new Map();
	pul.filter(pu => pu.type === 'replaceNode' && pu.target.nodeType === pu.target.ATTRIBUTE_NODE).forEach(pu => {
		const key = domFacade.getParentNode(pu.target);
		const values = map.get(key);
		if (values) {
			values.push(...pu.replacement);
		} else {
			map.set(key, pu.replacement);
		}
	});
	map.forEach((replacements, _element) => {
		const prefixes = {};
		replacements.forEach(replacement => {
			if (!prefixes[replacement.prefix]) {
				prefixes[replacement.prefix] = replacement.namespaceURI;
			}
			if (prefixes[replacement.prefix] !== replacement.namespaceURI) {
				throw errXUDY0024();
			}
		});
	});
	// c. upd:rename creates a namespace binding on $target, or on the parent (if any) of $target if $target is an attribute node, corresponding to the implied namespace binding of $newName.
};

export const mergeUpdates = function (pul1, ...puls) {
	return pul1.concat(...puls.filter(Boolean));
};
