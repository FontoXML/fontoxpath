define([
	'./deprecation/warnForUsingDeprecatedFeature',
	'./selectors/operators/UniversalSelector',

	// Have to import these to register extra methods on the Selector prototype
	'./selectors/selectorFluentApi'
], function (
	warnForUsingDeprecatedFeature,
	UniversalSelector
) {
	'use strict';

	return function matchAnything () {
		warnForUsingDeprecatedFeature('matchAnything will be removed next release.');
		return new UniversalSelector();
	};
});
