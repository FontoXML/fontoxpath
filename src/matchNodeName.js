define([
	'./deprecation/warnForUsingDeprecatedFeature',
	'./selectors/tests/NodeNameSelector',

	// Have to import this to register extra methods on the Selector prototype
	'./selectors/selectorFluentApi'
], function (
	warnForUsingDeprecatedFeature,

	NodeNameSelector
) {
	'use strict';

	/**
	 * @param  {String}  nodeName
	 */
	return function matchNodeName (nodeName) {
		warnForUsingDeprecatedFeature('matchNodeName will be removed in the next release');

		return new NodeNameSelector(nodeName);
	};
});
