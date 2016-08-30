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
	 * @param  {Selector}  siblingSelector
	 */
	function PrecedingSiblingAxis (siblingSelector) {
		Selector.call(this, siblingSelector.specificity, Selector.RESULT_ORDER_REVERSE_SORTED);

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


	PrecedingSiblingAxis.prototype.evaluate = function (dynamicContext) {
		var sequence = dynamicContext.contextItem,
			domFacade = dynamicContext.domFacade;

		function isMatchingSibling (selector, node) {
			return selector.evaluate(dynamicContext.createScopedContext({
				contextItem: Sequence.singleton(new NodeValue(domFacade, node)),
				contextSequence: null
			})).getEffectiveBooleanValue();
		}

		var siblingNode = sequence.value[0].value,
			nodes = [];
		while ((siblingNode = blueprintQuery.findPreviousSibling(
			domFacade,
			siblingNode,
			isMatchingSibling.bind(undefined, this._siblingSelector)))) {

			nodes.push(new NodeValue(dynamicContext.domFacade, siblingNode));
		}
		return new Sequence(nodes);
	};


	return PrecedingSiblingAxis;
});
