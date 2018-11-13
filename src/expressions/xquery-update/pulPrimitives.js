import {
	ReplaceElementContentPendingUpdate,
	ReplaceNodePendingUpdate,
	ReplaceValuePendingUpdate
} from './PendingUpdate';

export const replaceElementContent = function (/** !Element */target, /** Text|null */text) {
	return new ReplaceElementContentPendingUpdate(target, text);
};

export const replaceNode = function (/** !Node */target, /** !Array<!Node> */replacement) {
	return new ReplaceNodePendingUpdate(target, replacement);
};

export const replaceValue = function (/** !Node */target, /** string */stringValue) {
	return new ReplaceValuePendingUpdate(target, stringValue);
};
