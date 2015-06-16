define([
	'./selectors/NodeNameSelector',

	// Have to import these to register extra methods on the Selector prototype
	'./selectors/AttributeSelector',
	'./selectors/DescendantCombinatorSelector',
	'./selectors/NodeSpecSelector'
], function (
	NodeNameSelector
	) {
	'use strict';

	/**
	 * @param  {String}  nodeName
	 */
	return function matchNodeName (nodeName) {
		return new NodeNameSelector(nodeName);
	};
});

