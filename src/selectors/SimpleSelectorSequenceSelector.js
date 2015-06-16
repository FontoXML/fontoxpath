define([
	'./Selector'
], function (
	Selector
	) {
	'use strict';

	/**
	 * @param  {Selector}  firstSelector
	 * @param  {Selector}  secondSelector
	 */
	function SimpleSelectorSequenceSelector (firstSelector, secondSelector) {
		Selector.call(this, firstSelector.specificity.add(secondSelector.specificity));

		this._tests = [];
		if (firstSelector instanceof SimpleSelectorSequenceSelector) {
			this._tests = firstSelector._tests.concat();
		}
		else {
			this._tests.push(firstSelector.matches.bind(firstSelector));
		}

		this._tests.push(secondSelector.matches.bind(secondSelector));
	}

	SimpleSelectorSequenceSelector.prototype = Object.create(Selector.prototype);
	SimpleSelectorSequenceSelector.prototype.constructor = SimpleSelectorSequenceSelector;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	SimpleSelectorSequenceSelector.prototype.matches = function (node, blueprint) {
		return this._tests.every(function (test) {
			return test(node, blueprint);
		});
	};

	return SimpleSelectorSequenceSelector;
});

