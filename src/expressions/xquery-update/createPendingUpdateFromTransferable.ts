import {
	ConcreteAttributeNode,
	ConcreteChildNode,
	ConcreteElementNode,
	ConcreteParentNode,
	ConcreteTextNode,
} from '../../domFacade/ConcreteNode';
import { Node } from '../../types/Types';
import QName from '../dataTypes/valueTypes/QName';
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

export type TransferablePendingUpdate = {
	content?: Node[];
	newName?: QName;
	replacement?: Node[];
	'string-value'?: string;
	target?: Node;
	text?: Node;
	type: string;
};

export default function createPendingUpdateFromTransferable(
	transferable: TransferablePendingUpdate,
): IPendingUpdate {
	switch (transferable['type']) {
		case 'delete':
			return new DeletePendingUpdate({
				node: transferable['target'] as ConcreteChildNode,
				graftAncestor: null,
			});
		case 'insertAfter':
			return new InsertAfterPendingUpdate(
				{
					node: transferable['target'] as ConcreteChildNode,
					graftAncestor: null,
				},
				transferable['content'].map((contentNode: ConcreteChildNode) => {
					return { node: contentNode, graftAncestor: null };
				}),
			);
		case 'insertBefore':
			return new InsertBeforePendingUpdate(
				{ node: transferable['target'] as ConcreteParentNode, graftAncestor: null },
				transferable['content'].map((contentNode: ConcreteChildNode) => {
					return { node: contentNode, graftAncestor: null };
				}),
			);
		case 'insertInto':
			return new InsertIntoPendingUpdate(
				{ node: transferable['target'] as ConcreteElementNode, graftAncestor: null },
				transferable['content'].map((contentNode: ConcreteChildNode) => {
					return { node: contentNode, graftAncestor: null };
				}),
			);
		case 'insertIntoAsFirst':
			return new InsertIntoAsFirstPendingUpdate(
				{ node: transferable['target'] as ConcreteElementNode, graftAncestor: null },
				transferable['content'].map((contentNode: ConcreteChildNode) => {
					return { node: contentNode, graftAncestor: null };
				}),
			);
		case 'insertIntoAsLast':
			return new InsertIntoAsLastPendingUpdate(
				{ node: transferable['target'] as ConcreteElementNode, graftAncestor: null },
				transferable['content'].map((contentNode: ConcreteChildNode) => {
					return { node: contentNode, graftAncestor: null };
				}),
			);
		case 'insertAttributes':
			return new InsertAttributesPendingUpdate(
				{ node: transferable['target'] as ConcreteElementNode, graftAncestor: null },
				transferable['content'].map((contentNode: ConcreteAttributeNode) => {
					return { node: contentNode, graftAncestor: null };
				}),
			);
		case 'rename':
			return new RenamePendingUpdate(
				{ node: transferable['target'] as ConcreteElementNode, graftAncestor: null },
				transferable['newName'],
			);
		case 'replaceNode':
			return new ReplaceNodePendingUpdate(
				{
					node: transferable['target'] as ConcreteChildNode,
					graftAncestor: null,
				},
				transferable['replacement'].map((contentNode: ConcreteChildNode) => {
					return { node: contentNode, graftAncestor: null };
				}),
			);
		case 'replaceValue':
			return new ReplaceValuePendingUpdate(
				{
					node: transferable['target'] as ConcreteElementNode,
					graftAncestor: null,
				},
				transferable['string-value'],
			);
		case 'replaceElementContent':
			return new ReplaceElementContentPendingUpdate(
				{ node: transferable['target'] as ConcreteElementNode, graftAncestor: null },
				transferable['text']
					? { node: transferable['text'] as ConcreteTextNode, graftAncestor: null }
					: null,
			);
		default:
			throw new Error(
				`Unexpected type "${transferable['type']}" when parsing a transferable pending update.`,
			);
	}
}
