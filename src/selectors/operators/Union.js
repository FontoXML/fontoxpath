import isSameSetOfSelectors from '../isSameSetOfSelectors';
import Specificity from '../Specificity';
import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import sortNodeValues from '../dataTypes/sortNodeValues';

/**
 * The 'union' combining selector, or when matching, concats otherwise.
 * order is undefined.
 * @extends {Selector}
 */
class Union extends Selector {
	/**
	 * @param  {Array<Selector>}  selectors
	 */
	constructor (selectors) {
		super(
			selectors.reduce(function (maxSpecificity, selector) {
				if (maxSpecificity.compareTo(selector.specificity) > 0) {
					return maxSpecificity;
				}
				return selector.specificity;
			}, new Specificity({})),
			Selector.RESULT_ORDERINGS.UNSORTED);

		this._subSelectors = selectors;
	}

	equals (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof Union &&
			isSameSetOfSelectors(this._subSelectors, otherSelector._subSelectors);
	}

	evaluate (dynamicContext) {
		var nodeSet = this._subSelectors.reduce(function (resultingNodeSet, selector) {
				var results = selector.evaluate(dynamicContext);
				var allItemsAreNode = results.value.every(function (valueItem) {
						return valueItem.instanceOfType('node()');
					});

				if (!allItemsAreNode) {
					throw new Error('ERRXPTY0004: The sequences to union are not of type node()*');
				}
				results.value.forEach(function (nodeValue) {
					resultingNodeSet.add(nodeValue);
				});
				return resultingNodeSet;
			}, new Set());

		var sortedValues = sortNodeValues(dynamicContext.domFacade, Array.from(nodeSet.values()));
		return new Sequence(sortedValues);
	}
}
export default Union;
