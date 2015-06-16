define([
	'./selectors/UniversalSelector',

	// Have to import these to register extra methods on the Selector prototype
	'./selectors/AttributeSelector',
	'./selectors/DescendantCombinatorSelector',
	'./selectors/NodeSpecSelector'
], function (
	UniversalSelector
	) {
	'use strict';

	return function matchAnything () {
		return new UniversalSelector();
	};
});

