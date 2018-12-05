import {
	RenamePendingUpdate,
	ReplaceElementContentPendingUpdate,
	ReplaceNodePendingUpdate,
	ReplaceValuePendingUpdate
} from './PendingUpdate';
import QName from '../dataTypes/valueTypes/QName';

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
