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
import ConcreteNode from 'src/domFacade/ConcreteNode';

export const deletePu = function(target: ConcreteNode) {
	return new DeletePendingUpdate(target);
};

export const insertAfter = function(target: ConcreteNode, content: ConcreteNode[]) {
	return new InsertAfterPendingUpdate(target, content);
};

export const insertBefore = function(target: ConcreteNode, content: ConcreteNode[]) {
	return new InsertBeforePendingUpdate(target, content);
};

export const insertInto = function(target: ConcreteNode, content: ConcreteNode[]) {
	return new InsertIntoPendingUpdate(target, content);
};

export const insertIntoAsFirst = function(target: ConcreteNode, content: ConcreteNode[]) {
	return new InsertIntoAsFirstPendingUpdate(target, content);
};

export const insertIntoAsLast = function(target: ConcreteNode, content: ConcreteNode[]) {
	return new InsertIntoAsLastPendingUpdate(target, content);
};

export const insertAttributes = function(target: Element, content: Attr[]) {
	return new InsertAttributesPendingUpdate(target, content);
};

export const rename = function(target: ConcreteNode, newName: QName) {
	return new RenamePendingUpdate(target, newName);
};

export const replaceElementContent = function(target: Element, text: Text | null) {
	return new ReplaceElementContentPendingUpdate(target, text);
};

export const replaceNode = function(target: ConcreteNode, replacement: ConcreteNode[]) {
	return new ReplaceNodePendingUpdate(target, replacement);
};

export const replaceValue = function(target: ConcreteNode, stringValue: string) {
	return new ReplaceValuePendingUpdate(target, stringValue);
};
