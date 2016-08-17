define([
	'../Selector',
	'../dataTypes/Sequence'
], function (
	Selector,
	Sequence
) {
	'use strict';

	/**
	 * @param  {Selector}  parentSelector
	 */
	function ParentAxis (parentSelector) {
		Selector.call(this, parentSelector.specificity);

		this._parentSelector = parentSelector;
	}

	ParentAxis.prototype = Object.create(Selector.prototype);
	ParentAxis.prototype.constructor = ParentAxis;

	ParentAxis.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof ParentAxis &&
			this._parentSelector.equals(otherSelector._parentSelector);
	};

	ParentAxis.prototype.evaluate = function (nodeSequence, blueprint) {
		return new Sequence(
			nodeSequence.value
				.map(blueprint.getParentNode.bind(blueprint))
				.filter(function (node) {
					var result = this._parentSelector.evaluate(Sequence.singleton(node), blueprint);
					return result.getEffectiveBooleanValue();
				}.bind(this)));
	};

	return ParentAxis;
});
