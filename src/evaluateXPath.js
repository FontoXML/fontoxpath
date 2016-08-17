define([
	'./selectors/dataTypes/Sequence',
	'./selectors/dataTypes/NodeValue'
], function (
	Sequence,
	NodeValue
) {
	'use strict';

	function evaluateXPath (xPathSelector, contextNode, blueprint, resultType) {
		var contextSequence = Sequence.singleton(new NodeValue(contextNode, blueprint));
		var rawResults = xPathSelector.evaluate(contextSequence, blueprint);

		if (rawResults.isEmpty()) {
			return [];
		}

		if (rawResults.isSingleton() && !(rawResults.value[0] instanceof NodeValue)) {
			return rawResults.value[0].value;
		}

		return rawResults.value.map(function (value) {
			return value._node;
		});
	}

	evaluateXPath.BOOLEAN_TYPE = {};
	evaluateXPath.ANY_TYPE = {};
	evaluateXPath.NUMBER_TYPE = {};
	evaluateXPath.BOOLEAN_TYPE = {};

	return evaluateXPath;
});
