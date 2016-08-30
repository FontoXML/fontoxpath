define([
	'./evaluateXPath'
], function (
	evaluateXPath
) {
	'use strict';

	return function evaluateXPathToNumber (selector, contextNode, blueprint, variables) {
		return evaluateXPath(selector, contextNode, blueprint, variables, evaluateXPath.NUMBER_TYPE);
	};
});
