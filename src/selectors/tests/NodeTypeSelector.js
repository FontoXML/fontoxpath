define([
	'../Selector',
	'../dataTypes/Sequence',
	'../dataTypes/BooleanValue',
	'../Specificity'
], function (
	Selector,
	Sequence,
	BooleanValue,
	Specificity
	) {
	'use strict';

	/**
	 * @param  {Number}  nodeType
	 */
	function NodeTypeSelector (nodeType) {
		Selector.call(this, new Specificity({nodeType: 1}));

		this._nodeType = nodeType;
	}

	NodeTypeSelector.prototype = Object.create(Selector.prototype);
	NodeTypeSelector.prototype.constructor = NodeTypeSelector;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	NodeTypeSelector.prototype.matches = function (node, blueprint) {
		return node.nodeType === this._nodeType;
	};

	NodeTypeSelector.prototype.evaluate = function (sequence, blueprint) {
		return Sequence.singleton(new BooleanValue(this.matches(sequence.value[0], blueprint)));
	};

	NodeTypeSelector.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof NodeTypeSelector &&
			this._nodeType === otherSelector._nodeType;
	};

	NodeTypeSelector.prototype.getBucket = function () {
		return 'type-' + this._nodeType;
	};

	return NodeTypeSelector;
});
