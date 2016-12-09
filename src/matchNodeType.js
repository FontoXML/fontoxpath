define([
	'./deprecation/warnForUsingDeprecatedFeature',
	'./selectors/tests/NodeTypeSelector',

	// Have to import this to register extra methods on the Selector prototype
	'./selectors/selectorFluentApi'
], function (
	warnForUsingDeprecatedFeature,
	NodeTypeSelector
) {
	'use strict';

	/**
	 * @param  {Number}  nodeType
	 */
	return function matchNodeType (nodeType) {
		warnForUsingDeprecatedFeature('matchNodeType will be removed in the next release');
		return new NodeTypeSelector(nodeType);
	};
});
