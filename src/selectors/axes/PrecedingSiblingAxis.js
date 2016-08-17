define([
	'fontoxml-blueprints',

	'../Selector',
	'../dataTypes/Sequence'
], function (
	blueprints,

	Selector,
	Sequence
) {
	'use strict';

	var blueprintQuery = blueprints.blueprintQuery;

	/**
	 * @param  {Selector}  siblingSelector
	 */
	function PrecedingSiblingAxis (siblingSelector) {
		Selector.call(this, siblingSelector.specificity);

		this._siblingSelector = siblingSelector;
	}

	PrecedingSiblingAxis.prototype = Object.create(Selector.prototype);
	PrecedingSiblingAxis.prototype.constructor = PrecedingSiblingAxis;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	PrecedingSiblingAxis.prototype.matches = function (node, blueprint) {
		return !!blueprintQuery.findPreviousSibling(blueprint, node, function (childNode) {
			return this._siblingSelector.matches(childNode, blueprint);
		}.bind(this));
	};

	/**
	 * @param  {Selector}  otherSelector
	 */
	PrecedingSiblingAxis.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof PrecedingSiblingAxis &&
			this._siblingSelector.equals(otherSelector._siblingSelector);
	};


	PrecedingSiblingAxis.prototype.evaluate = function (sequence, blueprint) {
		function isMatchingSibling (selector, node) {
			return selector.evaluate(Sequence.singleton(node), blueprint).getEffectiveBooleanValue();
		}
		return sequence.value.reduce(function (resultingSequence, node) {
			var sibling = node;
			var nodes = [];
			while ((sibling = blueprintQuery.findPreviousSibling(
				blueprint,
				sibling,
				isMatchingSibling.bind(undefined, this._siblingSelector)))) {

				nodes.push(sibling);
			}
			resultingSequence.merge(new Sequence(nodes));
			return resultingSequence;
		}.bind(this), new Sequence());
	};


	return PrecedingSiblingAxis;
});
