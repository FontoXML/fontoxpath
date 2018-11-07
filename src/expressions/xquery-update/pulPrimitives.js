export const replaceNode = function (/** NodeValue */target, /** Array<NodeValue> */replacement) {
	return {
		type: 'replaceNode',
		target: target,
		replacement: replacement
	};
};
