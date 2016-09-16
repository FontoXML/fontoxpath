define([
	'fontoxml-dom-utils/domInfo',

	'../dataTypes/BooleanValue',
	'../dataTypes/Sequence',
	'../Selector',
	'../Specificity',
	'../isSameArray'
], function (
	domInfo,

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
		Selector.call(this, new Specificity({nodeName: 1}), Selector.RESULT_ORDER_SORTED);

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
			return Sequence.singleton(new BooleanValue(false));
		}

		var returnValue;
		if (!node.instanceOfType('attribute()') && !node.instanceOfType('element()')) {
			returnValue = false;
		}
		else if (this._nodeName === '*') {
			returnValue = true;
		}
		else {
			returnValue = Array.isArray(this._nodeName) ?
				this._nodeName.indexOf(node.nodeName) > -1 :
				this._nodeName === node.nodeName;
		}

		return Sequence.singleton(new BooleanValue(returnValue));
	};

	NodeNameSelector.prototype.getBucket = function () {
		return 'name-' + this._nodeName;
	};
	return NodeNameSelector;
});
