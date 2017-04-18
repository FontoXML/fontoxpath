import Selector from '../Selector';

/**
 * @extends {Selector}
 */
class Filter extends Selector {
	/**
	 * @param  {Selector}    selector
	 * @param  {Selector}    filterSelector
	 */
	constructor (selector, filterSelector) {
		super(selector.specificity.add(filterSelector.specificity), selector.expectedResultOrder);

		this._selector = selector;
		this._filterSelector = filterSelector;

		this._getStringifiedValue = () => `(filter ${this._selector} ${this._filterSelector})`;
	}

	getBucket () {
		return this._selector.getBucket();
	}

	evaluate (dynamicContext) {
		const valuesToFilter = this._selector.evaluate(dynamicContext);
		const filterSelector = this._filterSelector;
		return valuesToFilter.filter((item, i) => {
			const result = filterSelector.evaluate(dynamicContext._createScopedContext({
				contextSequence: valuesToFilter,
				contextItemIndex: i,
				contextItem: item
			}));

			if (result.isEmpty()) {
				return false;
			}

			const resultValue = result.first();
			if (resultValue.instanceOfType('xs:numeric')) {
				// Remember: XPath is one-based
				return resultValue.value === i + 1;
			}

			return result.getEffectiveBooleanValue();
		});
	}
}

export default Filter;
