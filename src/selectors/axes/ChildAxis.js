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
	 * @param  {Selector}  childSelector
	 */
	function ChildAxis (childSelector) {
		Selector.call(this, childSelector.specificity, Selector.RESULT_ORDER_SORTED);

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
		var contextItem = dynamicContext.contextItem,
			domFacade = dynamicContext.domFacade;
		var nodeValues = blueprintQuery.findChildren(domFacade, contextItem.value[0].value, function (node) {
				return this._childSelector.evaluate(
					dynamicContext.createScopedContext({
						contextItem: Sequence.singleton(new NodeValue(dynamicContext.domFacade, node)),
						contextSequence: null
					})).getEffectiveBooleanValue();
			}.bind(this)).map(function (node) {
				return new NodeValue(dynamicContext.domFacade, node);
			});

		return new Sequence(nodeValues);
	};

	return ChildAxis;
});
