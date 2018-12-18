import {
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

export const insertAfter = function (/** !Node */target, /** Array<!Node> */content) {
	return new InsertAfterPendingUpdate(target, content);
};

export const insertBefore = function (/** !Node */target, /** Array<!Node> */content) {
	return new InsertBeforePendingUpdate(target, content);
};

export const insertInto = function (/** !Node */target, /** Array<!Node> */content) {
	return new InsertIntoPendingUpdate(target, content);
};

export const insertIntoAsFirst = function (/** !Node */target, /** Array<!Node> */content) {
	return new InsertIntoAsFirstPendingUpdate(target, content);
};

export const insertIntoAsLast = function (/** !Node */target, /** Array<!Node> */content) {
	return new InsertIntoAsLastPendingUpdate(target, content);
};

export const insertAttributes = function (/** !Element */target, /** Array<!Attr> */content) {
	return new InsertAttributesPendingUpdate(target, content);
};

export const rename = function (/** !Node */target, /** !QName */newName) {
	return new RenamePendingUpdate(target, newName);
};

export const replaceElementContent = function (/** !Element */target, /** Text|null */text) {
	return new ReplaceElementContentPendingUpdate(target, text);
};

export const replaceNode = function (/** !Node */target, /** !Array<!Node> */replacement) {
	return new ReplaceNodePendingUpdate(target, replacement);
};

export const replaceValue = function (/** !Node */target, /** string */stringValue) {
	return new ReplaceValuePendingUpdate(target, stringValue);
};
