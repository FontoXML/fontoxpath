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
			return new DeletePendingUpdate(transferable['target']);
		case 'insertAfter':
			return new InsertAfterPendingUpdate(transferable['target'], transferable['content']);
		case 'insertBefore':
			return new InsertBeforePendingUpdate(transferable['target'], transferable['content']);
		case 'insertInto':
			return new InsertIntoPendingUpdate(transferable['target'], transferable['content']);
		case 'insertIntoAsFirst':
			return new InsertIntoAsFirstPendingUpdate(
				transferable['target'],
				transferable['content']
			);
		case 'insertIntoAsLast':
			return new InsertIntoAsLastPendingUpdate(
				transferable['target'],
				transferable['content']
			);
		case 'insertAttributes':
			return new InsertAttributesPendingUpdate(
				transferable['target'],
				transferable['content']
			);
		case 'rename':
			return new RenamePendingUpdate(transferable['target'], transferable['newName']);
		case 'replaceNode':
			return new ReplaceNodePendingUpdate(
				transferable['target'],
				transferable['replacement']
			);
		case 'replaceValue':
			return new ReplaceValuePendingUpdate(
				transferable['target'],
				transferable['string-value']
			);
		case 'replaceElementContent':
			return new ReplaceElementContentPendingUpdate(
				transferable['target'],
				transferable['text']
			);
		default:
			throw new Error(
				`Unexpected type "${transferable['type']}" when parsing a transferable pending update.`
			);
	}
}
