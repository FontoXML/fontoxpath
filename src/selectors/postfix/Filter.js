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
	}

	getBucket () {
		return this._selector.getBucket();
	}

	evaluate (dynamicContext) {
		var valuesToFilter = this._selector.evaluate(dynamicContext);

		var filteredValues = valuesToFilter.value.filter(function (value, index) {
				var result = this._filterSelector.evaluate(
						dynamicContext.createScopedContext({
							contextItem: Sequence.singleton(value),
							contextSequence: valuesToFilter
						}));

				if (result.isEmpty()) {
					return false;
				}

				var resultValue = result.value[0];
				if (resultValue.instanceOfType('xs:numeric')) {
					// Remember: XPath is one-based
					return resultValue.value === index + 1;
				}

				return result.getEffectiveBooleanValue();
			}.bind(this));

		return new Sequence(filteredValues);
	}
}

export default Filter;
