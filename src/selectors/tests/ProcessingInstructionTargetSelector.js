import BooleanValue from '../dataTypes/BooleanValue';
import Sequence from '../dataTypes/Sequence';
import Selector from '../Selector';
import Specificity from '../Specificity';

/**
 * @extends {Selector}
 */
class ProcessingInstructionTargetSelector extends Selector {
	/**
	 * @param  {string}  target
	 */
	constructor (target) {
		super(new Specificity({
			[Specificity.NODENAME_KIND]: 1
		}), Selector.RESULT_ORDERINGS.SORTED);

		this._target = target;
	}

	evaluate (dynamicContext) {
		var sequence = dynamicContext.contextItem;
		// Assume singleton
		var nodeValue = sequence.value[0];
		var isMatchingProcessingInstruction = nodeValue.instanceOfType('processing-instruction()') &&
			nodeValue.value.target === this._target;
		return Sequence.singleton(isMatchingProcessingInstruction ? BooleanValue.TRUE : BooleanValue.FALSE);
	}

	equals (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof ProcessingInstructionTargetSelector &&
			this._target === otherSelector._target;
	}

	getBucket () {
		return 'type-7';
	}
}
export default ProcessingInstructionTargetSelector;
