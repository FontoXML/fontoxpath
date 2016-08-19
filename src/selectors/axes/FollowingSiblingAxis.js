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
	function FollowingSiblingAxis (siblingSelector) {
		Selector.call(this, siblingSelector.specificity);

		this._siblingSelector = siblingSelector;
	}

	FollowingSiblingAxis.prototype = Object.create(Selector.prototype);
	FollowingSiblingAxis.prototype.constructor = FollowingSiblingAxis;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	FollowingSiblingAxis.prototype.matches = function (node, blueprint) {
		return !!blueprintQuery.findNextSibling(blueprint, node, function (childNode) {
			return this._siblingSelector.matches(childNode, blueprint);
		}.bind(this));
	};

	/**
	 * @param  {Selector}  otherSelector
	 */
	FollowingSiblingAxis.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof FollowingSiblingAxis &&
			this._siblingSelector.equals(otherSelector._siblingSelector);
	};

	FollowingSiblingAxis.prototype.evaluate = function (dynamicContext) {
		var sequence = dynamicContext.contextItem,
			blueprint = dynamicContext.blueprint;

		function isMatchingSibling (selector, node) {
			return selector.evaluate(dynamicContext.createScopedContext({
				contextItem: Sequence.singleton(node),
				contextSequence: null
			})).getEffectiveBooleanValue();
		}
		return sequence.value.reduce(function (resultingSequence, node) {
			var sibling = node;
			var nodes = [];
			while ((sibling = blueprintQuery.findNextSibling(
				blueprint,
				sibling,
				isMatchingSibling.bind(undefined, this._siblingSelector)))) {

				nodes.push(sibling);
			}
			resultingSequence.merge(new Sequence(nodes));
			return resultingSequence;
		}.bind(this), new Sequence());
	};

	return FollowingSiblingAxis;
});
