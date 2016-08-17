define([
	'./selectors/tests/ProcessingInstructionTargetSelector',
], function (
	ProcessingInstructionTargetSelector
) {
	'use strict';

	/**
	 * @param  {String}  target
	 */
	return function matchProcessingInstructionTarget (target) {
		return new ProcessingInstructionTargetSelector(target);
	};
});
