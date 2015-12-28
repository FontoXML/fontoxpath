define([
	'./Selector',
	'./CompositeSelector',
	'./Specificity',
	'./isSameArray'
], function (
	Selector,
	CompositeSelector,
	Specificity,
	isSameArray
	) {
	'use strict';

	/**
	 * @param  {String}    attributeName
	 * @param  {String[]}  [attributeValues]  if omitted, the selector matches if the attribute is present
	 */
	function AttributeSelector (attributeName, attributeValues) {
		Selector.call(this, new Specificity({attribute: 1}));

		this._attributeName = attributeName;
		this._attributeValues = attributeValues && attributeValues.concat().sort();
	}

	AttributeSelector.prototype = Object.create(Selector.prototype);
	AttributeSelector.prototype.constructor = AttributeSelector;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	AttributeSelector.prototype.matches = function (node, blueprint) {
		if (this._attributeValues === undefined) {
			return blueprint.getAttribute(node, this._attributeName) !== null;
		}

		return this._attributeValues.some(function (attributeValue) {
			return blueprint.getAttribute(node, this._attributeName) === attributeValue;
		}.bind(this));
	};

	AttributeSelector.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		if (!this._attributeValues && !otherSelector.attributeValues) {
			return true;
		}

		if ((this.attributeValues && !otherSelector.attributeValues) ||
			(!this._attributeValues && otherSelector.attributeValues)) {
			return false;
		}

		return this._attributeName === otherSelector.attributeName &&
			isSameArray(this._attributeValues, otherSelector.attributeValues);
	};

	return AttributeSelector;
});
