define([
	'../dataTypes/BooleanValue',
	'../dataTypes/Sequence',
	'../Selector',
	'../Specificity',
	'../isSameArray'
], function (
	BooleanValue,
	Sequence,
	Selector,
	Specificity,
	isSameArray
) {
	'use strict';

	/**
	 * @param  {String|String[]}  nodeName
	 */
	function NodeNameSelector (nodeName) {
		var specificity = {nodeName: 1};
		if (nodeName === '*') {
			specificity = {nodeType: 1};
		}
		Selector.call(this, new Specificity(specificity), Selector.RESULT_ORDER_SORTED);

		// Do not coerce the string/string[] to string[] because this costs performance in domInfo.isElement
		this._nodeName = nodeName;

		if (Array.isArray(this._nodeName)) {
			this._nodeName = this._nodeName.concat().sort();
		}
	}

	NodeNameSelector.prototype = Object.create(Selector.prototype);
	NodeNameSelector.prototype.constructor = NodeNameSelector;

	NodeNameSelector.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		if (!(otherSelector instanceof NodeNameSelector)) {
			return false;
		}

		var nodeNames = Array.isArray(this._nodeName) ? this._nodeName : [this._nodeName],
		otherNodeNames = Array.isArray(otherSelector._nodeName) ? otherSelector._nodeName : [otherSelector._nodeName];

		return isSameArray(nodeNames, otherNodeNames);
	};

	NodeNameSelector.prototype.evaluate = function (dynamicContext) {
		var sequence = dynamicContext.contextItem,
			node = sequence.value[0];

		if (!node.instanceOfType('element()') && !node.instanceOfType('attribute()')) {
			return Sequence.singleton(BooleanValue.FALSE);
		}

		if (this._nodeName === '*') {
			return Sequence.singleton(BooleanValue.TRUE);
		}
		var returnValue = Array.isArray(this._nodeName) ?
			this._nodeName.indexOf(node.nodeName) > -1 :
			this._nodeName === node.nodeName;
		return Sequence.singleton(returnValue ? BooleanValue.TRUE : BooleanValue.FALSE);
	};

	NodeNameSelector.prototype.getBucket = function () {
		if (this._nodeName === '*') {
			// While * is a test matching attributes or elements, buckets are never used to match nodes.
			return 'type-1';
		}
		return 'name-' + this._nodeName;
	};

	return NodeNameSelector;
});
