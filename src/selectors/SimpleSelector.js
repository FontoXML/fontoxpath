define([
	'./Selector'
], function (
	Selector
	) {
	'use strict';

	/**
	 * @param  {Specificity}  specificity
	 */
	function SimpleSelector (specificity) {
		Selector.call(this, specificity);
	}

	SimpleSelector.prototype = Object.create(Selector.prototype);
	SimpleSelector.prototype.constructor = SimpleSelector;

	return SimpleSelector;
});

