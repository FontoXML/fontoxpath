define([
	'../selectors/operators/UniversalSelector',
	'../selectors/operators/boolean/NotOperator',
], function (
	UniversalSelector,
	NotOperator

) {
	'use strict';

	// All built-in functions:

	return {
		not: function (compiledSubExpression) {
			return new NotOperator(compiledSubExpression[0]);
		},
		true: function () {
			return new UniversalSelector();
		},
		false: function () {
			return new NotOperator(new UniversalSelector());
		}
	};
});
