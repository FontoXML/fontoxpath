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

	/**
	 * Compare this selector to the other selector, checking equivalence
	 *
	 * @param   {Selector}  selector
	 * @return  {boolean}   Whether this selector is equivalent to the other
	 */
	Selector.prototype.equals = function (otherSelector) {
		throw new Error('Not Implemented');
	};

	return Selector;
});
