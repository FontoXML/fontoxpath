import Sequence from '../dataTypes/Sequence';
import Selector from '../Selector';
import Specificity from '../Specificity';
import createAtomicValue from '../dataTypes/createAtomicValue';
import isInstanceOfType from '../dataTypes/isInstanceOfType';

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
		}));

		this._target = target;

	}

	evaluate (dynamicContext) {
		// Assume singleton
		var nodeValue = dynamicContext.contextItem;
		var isMatchingProcessingInstruction = isInstanceOfType(nodeValue, 'processing-instruction()') &&
			nodeValue.value.target === this._target;
		return Sequence.singleton(createAtomicValue(isMatchingProcessingInstruction, 'xs:boolean'));
	}

	getBucket () {
		return 'type-7';
	}
}
export default ProcessingInstructionTargetSelector;
