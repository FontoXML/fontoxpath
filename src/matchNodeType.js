define([
	'./selectors/NodeTypeSelector',

	// Have to import these to register extra methods on the Selector prototype
	'./selectors/AttributeSelector',
	'./selectors/HasChildCombinatorSelector',
	'./selectors/HasDescendantCombinatorSelector',
	'./selectors/IsChildOfCombinatorSelector',
	'./selectors/IsDescendantOfCombinatorSelector',
	'./selectors/NodePredicateSelector'
], function (
	NodeTypeSelector
	) {
	'use strict';

	/**
	 * @param  {Number}  nodeType
	 */
	return function matchNodeType (nodeType) {
		return new NodeTypeSelector(nodeType);
	};
});

