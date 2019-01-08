import {
	DeletePendingUpdate,
	InsertAfterPendingUpdate,
	InsertAttributesPendingUpdate,
	InsertBeforePendingUpdate,
	InsertIntoPendingUpdate,
	InsertIntoAsFirstPendingUpdate,
	InsertIntoAsLastPendingUpdate,
	RenamePendingUpdate,
	ReplaceElementContentPendingUpdate,
	ReplaceNodePendingUpdate,
	ReplaceValuePendingUpdate
} from './PendingUpdate';
import QName from '../dataTypes/valueTypes/QName';

export const deletePu = function (target: Node) {
	return new DeletePendingUpdate(target);
};

export const insertAfter = function (target: Node, content: Node[]) {
	return new InsertAfterPendingUpdate(target, content);
};

export const insertBefore = function (target: Node, content: Node[]) {
	return new InsertBeforePendingUpdate(target, content);
};

export const insertInto = function (target: Node, content: Node[]) {
	return new InsertIntoPendingUpdate(target, content);
};

export const insertIntoAsFirst = function (target: Node, content: Node[]) {
	return new InsertIntoAsFirstPendingUpdate(target, content);
};

export const insertIntoAsLast = function (target: Node, content: Node[]) {
	return new InsertIntoAsLastPendingUpdate(target, content);
};

export const insertAttributes = function (target: Element, content: Attr[]) {
	return new InsertAttributesPendingUpdate(target, content);
};

export const rename = function (target: Node, newName: QName) {
	return new RenamePendingUpdate(target, newName);
};

export const replaceElementContent = function (target: Element, text: Text|null) {
	return new ReplaceElementContentPendingUpdate(target, text);
};

export const replaceNode = function (target: Node, replacement: Node[]) {
	return new ReplaceNodePendingUpdate(target, replacement);
};

export const replaceValue = function (target: Node, stringValue: string) {
	return new ReplaceValuePendingUpdate(target, stringValue);
};
