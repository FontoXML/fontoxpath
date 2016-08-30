define([
	'fontoxml-blueprints',

	'../Selector',
	'../dataTypes/Sequence',
	'../dataTypes/NodeValue'
], function (
	blueprints,

	Selector,
	Sequence,
	NodeValue
) {
	'use strict';

	var blueprintQuery = blueprints.blueprintQuery;

	/**
	 * @param  {Selector}  ancestorSelector
	 */
	function AncestorAxis (ancestorSelector) {
		Selector.call(this, ancestorSelector.specificity, Selector.RESULT_ORDER_REVERSE_SORTED);

		this._ancestorSelector = ancestorSelector;
	}

	AncestorAxis.prototype = Object.create(Selector.prototype);
	AncestorAxis.prototype.constructor = AncestorAxis;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	AncestorAxis.prototype.matches = function (node, blueprint) {
		var parentNode = blueprint.getParentNode(node);
		if (!parentNode) {
			// Out of document, fail
			return false;
		}

		return !!blueprintQuery.findClosestAncestor(blueprint, parentNode, function (ancestorNode) {
			return this._ancestorSelector.matches(ancestorNode, blueprint);
		}.bind(this));
	};

	AncestorAxis.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof AncestorAxis &&
			this._ancestorSelector.equals(otherSelector._ancestorSelector);
	};

	AncestorAxis.prototype.evaluate = function (dynamicContext) {
		var contextItem = dynamicContext.contextItem,
			domFacade = dynamicContext.domFacade;

		// Assume singleton, since axes are only valid in paths
		var nodeValues = blueprintQuery.findAllAncestors(domFacade, contextItem.value[0].value, false)
					.filter(function (node) {
						return this._ancestorSelector.evaluate({
							contextItem: Sequence.singleton(new NodeValue(dynamicContext.domFacade, node)),
							contextSequence: null,
							domFacade: domFacade
						}).getEffectiveBooleanValue();
					}.bind(this))
			.map(function (node) {
				return new NodeValue(dynamicContext.domFacade, node);
			});

		return new Sequence(nodeValues);
	};

	return AncestorAxis;
});
