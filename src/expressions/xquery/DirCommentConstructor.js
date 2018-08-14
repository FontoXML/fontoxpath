import Expression from '../Expression';
import Specificity from '../Specificity';

import createNodeValue from '../dataTypes/createNodeValue';
import Sequence from '../dataTypes/Sequence';

/**
 * @extends {Expression}
 */
class DircommentConstructor extends Expression {
	/**
	 * @param  {string}  contents
	 */
	constructor (contents) {
		super(
			new Specificity({}),
			[],
			{
				canBeStaticallyEvaluated: false,
				resultOrder: Expression.RESULT_ORDERINGS.UNSORTED
			});

		this._contents = contents;
	}

	evaluate (_dynamicContext, executionParameters) {
		const nodesFactory = executionParameters.nodesFactory;
		return Sequence.singleton(createNodeValue(nodesFactory.createComment(this._contents)));
	}
}

export default DircommentConstructor;
