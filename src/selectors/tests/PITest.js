import Sequence from '../dataTypes/Sequence';
import Selector from '../Selector';
import Specificity from '../Specificity';
import isSubtypeOf from '../dataTypes/isSubtypeOf';

/**
 * @extends {Selector}
 */
class PITest extends Selector {
	/**
	 * @param  {string}  target
	 */
	constructor (target) {
		super(new Specificity({
			[Specificity.NODENAME_KIND]: 1
		}), { canBeStaticallyEvaluated: false });

		this._target = target;

	}

	/**
	 * @param   {!../DynamicContext}      dynamicContext
	 * @return  {!../dataTypes/Sequence}
	 */
	evaluate (dynamicContext) {
		// Assume singleton
		var nodeValue = dynamicContext.contextItem;
		var isMatchingProcessingInstruction = isSubtypeOf(nodeValue.type, 'processing-instruction()') &&
			nodeValue.value.target === this._target;
		return isMatchingProcessingInstruction ? Sequence.singletonTrueSequence() : Sequence.singletonFalseSequence();
	}

	getBucket () {
		return 'type-7';
	}
}
export default PITest;
