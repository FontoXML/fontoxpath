define([
	'./deprecation/warnForUsingDeprecatedFeature',

	'./selectors/tests/ProcessingInstructionTargetSelector',
], function (
	warnForUsingDeprecatedFeature,

	ProcessingInstructionTargetSelector
) {
	'use strict';

	/**
	 * @param  {String}  target
	 */
	return function matchProcessingInstructionTarget (target) {
		warnForUsingDeprecatedFeature('matchProcessingInstructionTarget will be removed next release.');
		return new ProcessingInstructionTargetSelector(target);
	};
});
