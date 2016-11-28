define([
	'../dataTypes/BooleanValue',
	'../dataTypes/Sequence',
	'../Selector',
	'../Specificity'
], function (
	BooleanValue,
	Sequence,
	Selector,
	Specificity
) {
	'use strict';

	/**
	 * @param  {String}  target
	 */
	function ProcessingInstructionTargetSelector (target) {
		Selector.call(this, new Specificity({nodeName: 1}), Selector.RESULT_ORDER_SORTED);

		this._target = target;
	}

	ProcessingInstructionTargetSelector.prototype = Object.create(Selector.prototype);
	ProcessingInstructionTargetSelector.prototype.constructor = ProcessingInstructionTargetSelector;

	ProcessingInstructionTargetSelector.prototype.evaluate = function (dynamicContext) {
		var sequence = dynamicContext.contextItem;
		// Assume singleton
		var nodeValue = sequence.value[0];
		var isMatchingProcessingInstruction = nodeValue.instanceOfType('processing-instruction()') &&
			nodeValue.value.target === this._target;
		return Sequence.singleton(isMatchingProcessingInstruction ? BooleanValue.TRUE : BooleanValue.FALSE);
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
