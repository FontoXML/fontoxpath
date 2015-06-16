define([
	'./SimpleSelector',
	'./Specificity'
], function (
	SimpleSelector,
	Specificity
	) {
	'use strict';

	function UniversalSelector () {
		SimpleSelector.call(this, new Specificity({universal: 1}));
	}

	UniversalSelector.prototype = Object.create(SimpleSelector.prototype);
	UniversalSelector.prototype.constructor = UniversalSelector;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	UniversalSelector.prototype.matches = function (node, blueprint) {
		return true;
	};

	return UniversalSelector;
});

