export const replaceElementContent = function (/** ElementValue */target, /** text()? */text) {
	return {
		type: 'replaceElementContent',
		target: target,
		text: text
	};
};

export const replaceNode = function (/** NodeValue */target, /** Array<NodeValue> */replacement) {
	return {
		type: 'replaceNode',
		target: target,
		replacement: replacement
	};
};

export const replaceValue = function (/** NodeValue */target, /** xs:string */stringValue) {
	return {
		type: 'replaceValue',
		target: target,
		stringValue: stringValue
	};
};
