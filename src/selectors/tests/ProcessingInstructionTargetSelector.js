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

	toString () {
		if (!this._stringifiedValue) {
			this._stringifiedValue = `(processing-instruction ${this._target || ''})`;
		}
		return this._stringifiedValue;
	}

	evaluate (dynamicContext) {
		// Assume singleton
		var nodeValue = dynamicContext.contextItem;
		var isMatchingProcessingInstruction = nodeValue.instanceOfType('processing-instruction()') &&
			nodeValue.value.target === this._target;
		return Sequence.singleton(isMatchingProcessingInstruction ? BooleanValue.TRUE : BooleanValue.FALSE);
	}

	getBucket () {
		return 'type-7';
	}
}
export default ProcessingInstructionTargetSelector;
