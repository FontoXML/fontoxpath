import {
	AttributeNodePointer,
	ChildNodePointer,
	DocumentNodePointer,
	ElementNodePointer,
	TextNodePointer,
} from '../../domClone/Pointer';
import QName from '../dataTypes/valueTypes/QName';
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

export const deletePu = (target: AttributeNodePointer | ChildNodePointer) => {
	return new DeletePendingUpdate(target);
};

export const insertAfter = (target: ChildNodePointer, content: ChildNodePointer[]) => {
	return new InsertAfterPendingUpdate(target, content);
};

export const insertBefore = (
	target: ElementNodePointer | DocumentNodePointer,
	content: ChildNodePointer[]
) => {
	return new InsertBeforePendingUpdate(target, content);
};

export const insertInto = (target: ElementNodePointer, content: ChildNodePointer[]) => {
	return new InsertIntoPendingUpdate(target, content);
};

export const insertIntoAsFirst = (
	target: ElementNodePointer | DocumentNodePointer,
	content: ChildNodePointer[]
) => {
	return new InsertIntoAsFirstPendingUpdate(target, content);
};

export const insertIntoAsLast = (
	target: ElementNodePointer | DocumentNodePointer,
	content: ChildNodePointer[]
) => {
	return new InsertIntoAsLastPendingUpdate(target, content);
};

export const insertAttributes = (target: ElementNodePointer, content: AttributeNodePointer[]) => {
	return new InsertAttributesPendingUpdate(target, content);
};

export const rename = (target, newName: QName) => {
	return new RenamePendingUpdate(target, newName);
};

export const replaceElementContent = (target: ElementNodePointer, text: TextNodePointer | null) => {
	return new ReplaceElementContentPendingUpdate(target, text);
};

export const replaceNode = (
	target: AttributeNodePointer | ChildNodePointer,
	replacement: (AttributeNodePointer | ChildNodePointer)[]
) => {
	return new ReplaceNodePendingUpdate(target, replacement);
};

export const replaceValue = (
	target: ElementNodePointer | AttributeNodePointer,
	stringValue: string
) => {
	return new ReplaceValuePendingUpdate(target, stringValue);
};
