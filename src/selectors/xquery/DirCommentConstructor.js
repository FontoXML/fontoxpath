import Selector from '../Selector';
import Specificity from '../Specificity';

import createNodeValue from '../dataTypes/createNodeValue';
import Sequence from '../dataTypes/Sequence';

/**
 * @extends {Selector}
 */
class DircommentConstructor extends Selector {
	/**
	 * @param  {string}  comment
	 */
	constructor (contents) {
		super(new Specificity({}), {
			canBeStaticallyEvaluated: false,
			resultOrder: Selector.RESULT_ORDERINGS.UNSORTED
		});

		this._contents = contents;
	}

	evaluate (dynamicContext) {
		const nodesFactory = dynamicContext.nodesFactory;
		return Sequence.singleton(createNodeValue(nodesFactory.createComment(this._contents)));
	}
}

export default DircommentConstructor;
