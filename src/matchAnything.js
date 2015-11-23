define([
	'./selectors/UniversalSelector',

	// Have to import these to register extra methods on the Selector prototype
	'./selectors/AttributeSelector',
	'./selectors/HasChildCombinatorSelector',
	'./selectors/HasDescendantCombinatorSelector',
	'./selectors/IsChildOfCombinatorSelector',
	'./selectors/IsDescendantOfCombinatorSelector',
	'./selectors/IsNotCombinatorSelector',
	'./selectors/NodePredicateSelector'
], function (
	UniversalSelector
	) {
	'use strict';

	return function matchAnything () {
		return new UniversalSelector();
	};
});
