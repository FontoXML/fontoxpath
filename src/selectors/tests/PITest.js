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
	evaluateToBoolean (_dynamicContext, node) {
		// Assume singleton
		var isMatchingProcessingInstruction = isSubtypeOf(node.type, 'processing-instruction()') &&
			node.value.target === this._target;
		return isMatchingProcessingInstruction;
	}

	getBucket () {
		return 'type-7';
	}
}
export default PITest;
