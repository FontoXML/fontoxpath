define([
	'fontoxml-dom-utils/domInfo',

	'../Selector',
	'../Specificity'
], function (
	domInfo,

	Selector,
	Specificity
	) {
	'use strict';

	/**
	 * @param  {String}  target
	 */
	function ProcessingInstructionTargetSelector (target) {
		Selector.call(this, new Specificity({nodeName: 1}));

		this._target = target;
	}

	ProcessingInstructionTargetSelector.prototype = Object.create(Selector.prototype);
	ProcessingInstructionTargetSelector.prototype.constructor = ProcessingInstructionTargetSelector;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	ProcessingInstructionTargetSelector.prototype.matches = function (node, blueprint) {
		return domInfo.isProcessingInstruction(node) && node.target === this._target;
	};

	ProcessingInstructionTargetSelector.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof ProcessingInstructionTargetSelector &&
			this._target === otherSelector._target;
	};

	ProcessingInstructionTargetSelector.prototype.getBucket = function () {
		return 'type-7';
	};

	return ProcessingInstructionTargetSelector;
});
