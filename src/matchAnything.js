define([
	'./selectors/operators/UniversalSelector',

	// Have to import these to register extra methods on the Selector prototype
	'./selectors/selectorFluentApi'
], function (
	UniversalSelector
) {
	'use strict';

	return function matchAnything () {
		return new UniversalSelector();
	};
});
