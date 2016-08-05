define([
	'../Selector',
	'../Specificity'
], function (
	Selector,
	Specificity
	) {
	'use strict';

	function UniversalSelector () {
		Selector.call(this, new Specificity({universal: 1}));
	}

	UniversalSelector.prototype = Object.create(Selector.prototype);
	UniversalSelector.prototype.constructor = UniversalSelector;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	UniversalSelector.prototype.matches = function (node, blueprint) {
		return true;
	};

	UniversalSelector.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof UniversalSelector;
	};

	return UniversalSelector;
});
