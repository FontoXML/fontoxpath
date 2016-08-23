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
		Selector.call(this, new Specificity({nodeName: 1}));

		// Do not coerce the string/string[] to string[] because this costs performance in domInfo.isElement
		this._nodeName = nodeName;

		if (Array.isArray(this._nodeName)) {
			this._nodeName = this._nodeName.concat().sort();
		}
	}

	NodeNameSelector.prototype = Object.create(Selector.prototype);
	NodeNameSelector.prototype.constructor = NodeNameSelector;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	NodeNameSelector.prototype.matches = function (node, blueprint) {
		return domInfo.isElement(node, this._nodeName);
	};

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
			blueprint = dynamicContext.domFacade;
		return Sequence.singleton(new BooleanValue(this.matches(sequence.value[0].value, blueprint)));
	};

	NodeNameSelector.prototype.getBucket = function () {
		return 'name-' + this._nodeName;
	};
	return NodeNameSelector;
});
