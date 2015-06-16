define([
	'./selectors/NodeTypeSelector',

	// Have to import these to register extra methods on the Selector prototype
	'./selectors/AttributeSelector',
	'./selectors/ChildCombinatorSelector',
	'./selectors/DescendantCombinatorSelector',
	'./selectors/NodeSpecSelector'
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

