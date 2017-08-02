import Selector from '../Selector';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
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
			if (isSubtypeOf(resultValue.type, 'xs:numeric')) {
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

		const iteratorToFilter = valuesToFilter.value();
		let iteratorItem = null;
		let i = 0;
		let filterResultSequence = null;
		return new Sequence({
			next: () => {
				while (!iteratorItem || !iteratorItem.done) {
					if (!iteratorItem) {
						iteratorItem = iteratorToFilter.next();
					}
					if (iteratorItem.done) {
						return iteratorItem;
					}
					if (!iteratorItem.ready) {
						const itemToReturn = iteratorItem;
						iteratorItem = null;
						return itemToReturn;
					}
					if (!filterResultSequence) {
						filterResultSequence = this._filterSelector.evaluateMaybeStatically(
							dynamicContext.scopeWithFocus(i, iteratorItem.value, valuesToFilter));
					}

					const first = filterResultSequence.tryGetFirst();
					if (!first.ready) {
						return { done: false, ready: false, promise: first.promise };
					}
					let shouldReturnCurrentValue;
					if (first.value === null) {
						// Actually empty, very falsy indeed
						// Continue to next
						shouldReturnCurrentValue = false;
					}
					else if (isSubtypeOf(first.value.type, 'xs:numeric')) {
						// Remember: XPath is one-based
						shouldReturnCurrentValue = first.value.value === i + 1;
					}
					else {
						const ebv = filterResultSequence.tryGetEffectiveBooleanValue();
						if (!ebv.ready) {
							return { done: false, ready: false, promise: ebv.promise };
						}
						shouldReturnCurrentValue = ebv.value;
					}
					// Prepare awaiting the next one
					filterResultSequence = null;
					const returnableValue = iteratorItem.value;
					iteratorItem = null;
					i++;
					if (shouldReturnCurrentValue) {
						return { done: false, ready: true, value: returnableValue };
					}
					// Continue to the next one
				}

				return iteratorItem;
			}
		});
	}
}

export default Filter;
