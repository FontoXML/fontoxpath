import Specificity from '../Specificity';
import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import isInstanceOfType from '../dataTypes/isInstanceOfType';
import { sortNodeValues } from '../dataTypes/documentOrderUtils';

/**
 * The 'union' combining selector, or when matching, concats otherwise.
 * order is undefined.
 * @extends {Selector}
 */
class Union extends Selector {
	/**
	 * @param  {!Array<!Selector>}  selectors
	 */
	constructor (selectors) {
		const maxSpecificity = selectors.reduce((maxSpecificity, selector) => {
			if (maxSpecificity.compareTo(selector.specificity) > 0) {
				return maxSpecificity;
			}
			return selector.specificity;
		}, new Specificity({}));
		super(maxSpecificity);

		this._subSelectors = selectors;

	}

	evaluate (dynamicContext) {
		const nodeSet = this._subSelectors.reduce(function (resultingNodeSet, selector) {
			const results = selector.evaluate(dynamicContext);
			for (const nodeValue of results.value()) {
				if (!isInstanceOfType(nodeValue, 'node()')) {
					throw new Error('XPTY0004: The sequences to union are not of type node()*');
				}
				resultingNodeSet.add(nodeValue);
			}
			return resultingNodeSet;
		}, new Set());

		const sortedValues = sortNodeValues(dynamicContext.domFacade, Array.from(nodeSet.values()));
		return new Sequence(sortedValues);
	}
}
export default Union;
