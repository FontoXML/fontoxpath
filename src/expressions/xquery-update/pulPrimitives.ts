import { ConcreteNode } from '../../domFacade/ConcreteNode';
import { Attr, Element, Text } from '../../types/Types';
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

export const deletePu = (target: ConcreteNode) => {
	return new DeletePendingUpdate(target);
};

export const insertAfter = (target: ConcreteNode, content: ConcreteNode[]) => {
	return new InsertAfterPendingUpdate(target, content);
};

export const insertBefore = (target: ConcreteNode, content: ConcreteNode[]) => {
	return new InsertBeforePendingUpdate(target, content);
};

export const insertInto = (target: ConcreteNode, content: ConcreteNode[]) => {
	return new InsertIntoPendingUpdate(target, content);
};

export const insertIntoAsFirst = (target: ConcreteNode, content: ConcreteNode[]) => {
	return new InsertIntoAsFirstPendingUpdate(target, content);
};

export const insertIntoAsLast = (target: ConcreteNode, content: ConcreteNode[]) => {
	return new InsertIntoAsLastPendingUpdate(target, content);
};

export const insertAttributes = (target: Element, content: Attr[]) => {
	return new InsertAttributesPendingUpdate(target, content);
};

export const rename = (target: ConcreteNode, newName: QName) => {
	return new RenamePendingUpdate(target, newName);
};

export const replaceElementContent = (target: Element, text: Text | null) => {
	return new ReplaceElementContentPendingUpdate(target, text);
};

export const replaceNode = (target: ConcreteNode, replacement: ConcreteNode[]) => {
	return new ReplaceNodePendingUpdate(target, replacement);
};

export const replaceValue = (target: ConcreteNode, stringValue: string) => {
	return new ReplaceValuePendingUpdate(target, stringValue);
};
