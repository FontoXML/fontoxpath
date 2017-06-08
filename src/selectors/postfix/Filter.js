import Selector from '../Selector';
import isInstanceOfType from '../dataTypes/isInstanceOfType';
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
		super(selector.specificity.add(filterSelector.specificity), {
			resultOrder: selector.expectedResultOrder,
			peer: selector.peer,
			subtree: selector.subtree,
			canBeStaticallyEvaluated: selector.canBeStaticallyEvaluated && filterSelector.canBeStaticallyEvaluated
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
		const valuesToFilter = this._selector.evaluateMaybeStatically(dynamicContext);

		if (this._filterSelector.canBeStaticallyEvaluated) {
			// Shortcut, if this is numeric, all the values are the same numeric value, same for booleans
			/**
			 * @type {!Sequence}
			 */
			const result = this._filterSelector.evaluateMaybeStatically(dynamicContext);
			if (result.isEmpty()) {
				return result;
			}

			/**
			 * @type {../dataTypes/Value}
			 */
			const resultValue = result.first();
			if (isInstanceOfType(resultValue, 'xs:numeric')) {
				let requestedIndex = resultValue.value;
				if (!Number.isInteger(requestedIndex)) {
					// There are only values for integer positions
					return Sequence.empty();
				}
				const iterator = valuesToFilter.value();
				for (let value = iterator.next(); !value.done; value = iterator.next()) {
					if (requestedIndex-- === 1) {
						return Sequence.singleton(value.value);
					}
				}
				return Sequence.empty();
			}

			// If all the items resolve to true, we can return all items, or none if vice versa
			if (result.getEffectiveBooleanValue()) {
				return valuesToFilter;
			}
			return Sequence.empty();
		}

		return valuesToFilter.filter((item, i, sequence) => {
			const result = this._filterSelector.evaluateMaybeStatically(dynamicContext.createScopedContext({
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
