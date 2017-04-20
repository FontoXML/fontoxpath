import Selector from '../Selector';
import isInstanceOfType from '../dataTypes/isInstanceOfType';

/**
 * @extends {Selector}
 */
class Filter extends Selector {
	/**
	 * @param  {Selector}    selector
	 * @param  {Selector}    filterSelector
	 */
	constructor (selector, filterSelector) {
		super(selector.specificity.add(filterSelector.specificity), {
			resultOrder: selector.expectedResultOrder,
			peer: selector.peer,
			subtree: selector.subtree
		});

		this._selector = selector;
		this._filterSelector = filterSelector;
	}

	getBucket () {
		return this._selector.getBucket();
	}

	evaluate (dynamicContext) {
		/**
		 * @type {../dataTypes/Sequence}
		 */
		const valuesToFilter = this._selector.evaluate(dynamicContext);
		return valuesToFilter.filter((item, i, sequence) => {
			const result = this._filterSelector.evaluate(dynamicContext.createScopedContext({
				contextSequence: sequence,
				contextItemIndex: i,
				contextItem: item
			}));

			if (result.isEmpty()) {
				return false;
			}

			const resultValue = result.first();
			if (isInstanceOfType(resultValue, 'xs:numeric')) {
				// Remember: XPath is one-based
				return resultValue.value === i + 1;
			}

			return result.getEffectiveBooleanValue();
		});
	}
}

export default Filter;
