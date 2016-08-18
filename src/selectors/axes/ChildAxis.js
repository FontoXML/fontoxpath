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
	 * @param  {Selector}  childSelector
	 */
	function ChildAxis (childSelector) {
		Selector.call(this, childSelector.specificity);

		this._childSelector = childSelector;
	}

	ChildAxis.prototype = Object.create(Selector.prototype);
	ChildAxis.prototype.constructor = ChildAxis;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	ChildAxis.prototype.matches = function (node, blueprint) {
		return !!blueprintQuery.findChild(blueprint, node, function (childNode) {
			return this._childSelector.matches(childNode, blueprint);
		}.bind(this));
	};

	ChildAxis.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof ChildAxis &&
			this._childSelector.equals(otherSelector._childSelector);
	};

	ChildAxis.prototype.evaluate = function (dynamicContext) {
		var nodeSequence = dynamicContext.contextItem,
			blueprint = dynamicContext.blueprint;
		return nodeSequence.value.reduce(function (resultingSequence, node) {
			return resultingSequence.merge(new Sequence(
				blueprintQuery.findChildren(blueprint, node, function (node) {
					return this._childSelector.evaluate({
						blueprint: blueprint,
						contextItem: Sequence.singleton(node),
						contextSequence: null
					}).getEffectiveBooleanValue();
				}.bind(this))));
		}.bind(this), new Sequence());
	};

	return ChildAxis;
});
