define([
], function (
	) {
	'use strict';

	/**
	 * @param  {Specificity}  specificity
	 */
	function Selector (specificity) {
		/**
		 * @type  {Specificity}
		 */
		this.specificity = specificity;
	}

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	Selector.prototype.matches = function (node, blueprint) {
		throw new Error('Not implemented');
	};

	return Selector;
});

