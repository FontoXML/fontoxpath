import Expression from '../Expression';
import Specificity from '../Specificity';

import createNodeValue from '../dataTypes/createNodeValue';
import Sequence from '../dataTypes/Sequence';

/**
 * @extends {Expression}
 */
class DirPIConstructor extends Expression {
	/**
	 * @param  {!string}  target
	 * @param  {!string}  data
	 */
	constructor (target, data) {
		super(
			new Specificity({}),
			[],
			{
				canBeStaticallyEvaluated: false,
				resultOrder: Expression.RESULT_ORDERINGS.UNSORTED
			});

		this._target = target;
		this._data = data;
	}

	evaluate (_dynamicContext, executionParameters) {
		const nodesFactory = executionParameters.nodesFactory;
		return Sequence.singleton(createNodeValue(nodesFactory.createProcessingInstruction(this._target, this._data)));
	}
}

export default DirPIConstructor;
