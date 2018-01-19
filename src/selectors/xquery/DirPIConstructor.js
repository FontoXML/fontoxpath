import Selector from '../Selector';
import Specificity from '../Specificity';

import createNodeValue from '../dataTypes/createNodeValue';
import Sequence from '../dataTypes/Sequence';

/**
 * @extends {Selector}
 */
class DirPIConstructor extends Selector {
	/**
	 * @param  {!string}  target
	 * @param  {!string}  data
	 */
	constructor (target, data) {
		super(new Specificity({}), {
			canBeStaticallyEvaluated: false,
			resultOrder: Selector.RESULT_ORDERINGS.UNSORTED
		});

		this._target = target;
		this._data = data;
	}

	/**
	 * @param  {!../DynamicContext} dynamicContext
	 * @return {!Sequence}
	 */
	evaluate (dynamicContext) {
		const nodesFactory = dynamicContext.nodesFactory;
		return Sequence.singleton(createNodeValue(nodesFactory.createProcessingInstruction(this._target, this._data)));
	}
}

export default DirPIConstructor;
