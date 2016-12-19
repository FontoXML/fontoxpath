define([
	'../dataTypes/DoubleValue',
	'../dataTypes/Sequence'
], function (
	DoubleValue,
	Sequence
) {
	'use strict';

	function contextItemAsFirstArgument (fn, dynamicContext) {
		return fn(dynamicContext, dynamicContext.contextItem);
	}

	return {
		declarations: [
		],
		functions: {
		}
	};
});
