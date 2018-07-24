import Selector from '../Selector';
import Specificity from '../Specificity';

import createNodeValue from '../dataTypes/createNodeValue';
import Sequence from '../dataTypes/Sequence';

/**
 * @extends {Selector}
 */
class DircommentConstructor extends Selector {
	/**
	 * @param  {string}  contents
	 */
	constructor (contents) {
		super(
			new Specificity({}),
			[],
			{
				canBeStaticallyEvaluated: false,
				resultOrder: Selector.RESULT_ORDERINGS.UNSORTED
			});

		this._contents = contents;
	}

	/**
	 * @param  {!../DynamicContext} _dynamicContext
	 * @param  {!../ExecutionParameters} executionParameters
	 * @return {!Sequence}
	 */
	evaluate (_dynamicContext, executionParameters) {
		const nodesFactory = executionParameters.nodesFactory;
		return Sequence.singleton(createNodeValue(nodesFactory.createComment(this._contents)));
	}
}

export default DircommentConstructor;
