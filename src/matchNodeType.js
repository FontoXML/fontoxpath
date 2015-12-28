define([
	'./selectors/NodeTypeSelector',

	// Have to import this to register extra methods on the Selector prototype
	'./selectors/selectorFluentApi'
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
