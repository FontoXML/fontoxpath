import {
	ConcreteAttributeNode,
	ConcreteChildNode,
	ConcreteDocumentNode,
	ConcreteElementNode,
	ConcreteTextNode
} from '../../domFacade/ConcreteNode';
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

export const deletePu = (target: ConcreteAttributeNode | ConcreteChildNode) => {
	return new DeletePendingUpdate(target);
};

export const insertAfter = (target: ConcreteChildNode, content: ConcreteChildNode[]) => {
	return new InsertAfterPendingUpdate(target, content);
};

export const insertBefore = (
	target: ConcreteElementNode | import('../../domFacade/ConcreteNode').ConcreteDocumentNode,
	content: ConcreteChildNode[]
) => {
	return new InsertBeforePendingUpdate(target, content);
};

export const insertInto = (target: ConcreteElementNode, content: ConcreteChildNode[]) => {
	return new InsertIntoPendingUpdate(target, content);
};

export const insertIntoAsFirst = (
	target: ConcreteElementNode | import('../../domFacade/ConcreteNode').ConcreteDocumentNode,
	content: ConcreteChildNode[]
) => {
	return new InsertIntoAsFirstPendingUpdate(target, content);
};

export const insertIntoAsLast = (
	target: ConcreteElementNode | ConcreteDocumentNode,
	content: ConcreteChildNode[]
) => {
	return new InsertIntoAsLastPendingUpdate(target, content);
};

export const insertAttributes = (target: ConcreteElementNode, content: ConcreteAttributeNode[]) => {
	return new InsertAttributesPendingUpdate(target, content);
};

export const rename = (target, newName: QName) => {
	return new RenamePendingUpdate(target, newName);
};

export const replaceElementContent = (
	target: ConcreteElementNode,
	text: ConcreteTextNode | null
) => {
	return new ReplaceElementContentPendingUpdate(target, text);
};

export const replaceNode = (
	target: ConcreteAttributeNode | ConcreteChildNode,
	replacement: (ConcreteAttributeNode | ConcreteChildNode)[]
) => {
	return new ReplaceNodePendingUpdate(target, replacement);
};

export const replaceValue = (
	target: ConcreteElementNode | ConcreteAttributeNode,
	stringValue: string
) => {
	return new ReplaceValuePendingUpdate(target, stringValue);
};
