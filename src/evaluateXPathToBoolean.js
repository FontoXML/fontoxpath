define([
	'./evaluateXPath'
], function (
	evaluateXPath
) {
	'use strict';

	return function evaluateXPathToBoolean (selector, contextNode, blueprint, variables) {
		return evaluateXPath(selector, contextNode, blueprint, variables, evaluateXPath.BOOLEAN_TYPE);
	};
});
