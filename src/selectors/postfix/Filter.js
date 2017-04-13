import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';

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

		const filteredValues = [];
		for (const innerContext of dynamicContext.createSequenceIterator(valuesToFilter)) {
			const result = this._filterSelector.evaluate(innerContext);

			if (result.isEmpty()) {
				continue;
			}

			const resultValue = result.value[0];
			if (resultValue.instanceOfType('xs:numeric')) {
				// Remember: XPath is one-based
				if (resultValue.value === innerContext.contextItemIndex + 1) {
					filteredValues.push(innerContext.contextItem);
				}
				continue;
			}

			if (result.getEffectiveBooleanValue()) {
				filteredValues.push(innerContext.contextItem);
			}
		}

		return new Sequence(filteredValues);
	}
}

export default Filter;
