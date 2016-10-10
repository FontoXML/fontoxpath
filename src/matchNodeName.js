define([
	'./selectors/tests/NodeNameSelector',

	// Have to import this to register extra methods on the Selector prototype
	'./selectors/selectorFluentApi'
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
