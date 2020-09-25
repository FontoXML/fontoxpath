import {
	AttributeNodePointer,
	ChildNodePointer,
	DocumentNodePointer,
	ElementNodePointer,
	NodePointer,
	TextNodePointer,
	TinyNode,
} from '../../domClone/Pointer';
import { ConcreteNode } from '../../domFacade/ConcreteNode';
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

export default function fromTransferable(transferable: object): IPendingUpdate {
	switch (transferable['type']) {
		case 'delete':
			return new DeletePendingUpdate({
				node: transferable['target'],
				graftAncestor: null,
			});
		case 'insertAfter':
			return new InsertAfterPendingUpdate(
				{ node: transferable['target'], graftAncestor: null },
				transferable['content'].map((contentNode) => {
					return { node: contentNode, graftAncestor: null };
				})
			);
		case 'insertBefore':
			return new InsertBeforePendingUpdate(
				{ node: transferable['target'], graftAncestor: null },
				transferable['content'].map((contentNode) => {
					return { node: contentNode, graftAncestor: null };
				})
			);
		case 'insertInto':
			return new InsertIntoPendingUpdate(
				{ node: transferable['target'], graftAncestor: null },
				transferable['content'].map((contentNode) => {
					return { node: contentNode, graftAncestor: null };
				})
			);
		case 'insertIntoAsFirst':
			return new InsertIntoAsFirstPendingUpdate(
				{ node: transferable['target'], graftAncestor: null },
				transferable['content'].map((contentNode) => {
					return { node: contentNode, graftAncestor: null };
				})
			);
		case 'insertIntoAsLast':
			return new InsertIntoAsLastPendingUpdate(
				{ node: transferable['target'], graftAncestor: null },
				transferable['content'].map((contentNode) => {
					return { node: contentNode, graftAncestor: null };
				})
			);
		case 'insertAttributes':
			return new InsertAttributesPendingUpdate(
				{ node: transferable['target'], graftAncestor: null },
				transferable['content'].map((contentNode) => {
					return { node: contentNode, graftAncestor: null };
				})
			);
		case 'rename':
			return new RenamePendingUpdate(
				{ node: transferable['target'], graftAncestor: null },
				transferable['newName']
			);
		case 'replaceNode':
			return new ReplaceNodePendingUpdate(
				{ node: transferable['target'], graftAncestor: null },
				transferable['replacement'].map((contentNode) => {
					return { node: contentNode, graftAncestor: null };
				})
			);
		case 'replaceValue':
			return new ReplaceValuePendingUpdate(
				{ node: transferable['target'], graftAncestor: null },
				transferable['string-value']
			);
		case 'replaceElementContent':
			return new ReplaceElementContentPendingUpdate(
				{ node: transferable['target'], graftAncestor: null },
				transferable['text'] ? { node: transferable['text'], graftAncestor: null } : null
			);
		default:
			throw new Error(
				`Unexpected type "${transferable['type']}" when parsing a transferable pending update.`
			);
	}
}
