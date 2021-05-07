import { BaseType } from '../dataTypes/BaseType';
import ISequence from '../dataTypes/ISequence';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import sequenceFactory from '../dataTypes/sequenceFactory';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Expression from '../Expression';
import { DONE_TOKEN, IterationHint, ready } from '../util/iterators';

class Filter extends Expression {
	private _filterExpression: Expression;
	private _selector: Expression;

	constructor(selector: Expression, filterExpression: Expression) {
		super(
			selector.specificity.add(filterExpression.specificity),
			[selector, filterExpression],
			{
				canBeStaticallyEvaluated:
					selector.canBeStaticallyEvaluated && filterExpression.canBeStaticallyEvaluated,
				peer: selector.peer,
				resultOrder: selector.expectedResultOrder,
				subtree: selector.subtree,
			}
		);

		this._selector = selector;
		this._filterExpression = filterExpression;
	}

	public evaluate(dynamicContext: DynamicContext, executionParameters: ExecutionParameters) {
		const valuesToFilter = this._selector.evaluateMaybeStatically(
			dynamicContext,
			executionParameters
		);

		if (this._filterExpression.canBeStaticallyEvaluated) {
			// Shortcut, if this is numeric, all the values are the same numeric value, same for booleans
			const result = this._filterExpression.evaluateMaybeStatically(
				dynamicContext,
				executionParameters
			);
			if (result.isEmpty()) {
				return result;
			}

			const resultValue = result.first();
			if (isSubtypeOf(resultValue.type.kind, BaseType.XSNUMERIC)) {
				let requestedIndex: number = resultValue.value as number;
				if (!Number.isInteger(requestedIndex)) {
					// There are only values for integer positions
					return sequenceFactory.empty();
				}
				const iterator = valuesToFilter.value;
				let done = false;
				// Note that using filter here is a bad choice, because we only want one item.
				// TODO: implement Sequence.itemAt(i), which is a no-op for empty sequences, a O(1) op for array backed sequence / singleton sequences and a O(n) for normal sequences.
				// If we move sorting to sequences, this will be even faster, since a select is faster than a sort.
				return sequenceFactory.create({
					next: (_hint: IterationHint) => {
						if (!done) {
							for (
								let value = iterator.next(IterationHint.NONE);
								!value.done;
								value = iterator.next(IterationHint.NONE)
							) {
								if (requestedIndex-- === 1) {
									done = true;
									return value;
								}
							}
							done = true;
						}
						return DONE_TOKEN;
					},
				});
			}
			// If all the items resolve to true, we can return all items, or none if vice versa
			// This can be gotten synchronously, because of the check for static evaluation
			if (result.getEffectiveBooleanValue()) {
				return valuesToFilter;
			}
			return sequenceFactory.empty();
		}

		const iteratorToFilter = valuesToFilter.value;
		let iteratorItem = null;
		let i = 0;
		let filterResultSequence: ISequence = null;
		return sequenceFactory.create({
			next: (hint: IterationHint) => {
				// We should only apply the hint the first time we call the nested iterator
				let isHintApplied = false;
				while (!iteratorItem || !iteratorItem.done) {
					if (!iteratorItem) {
						iteratorItem = iteratorToFilter.next(
							isHintApplied ? IterationHint.NONE : hint
						);
						isHintApplied = true;
					}
					if (iteratorItem.done) {
						return iteratorItem;
					}
					if (!filterResultSequence) {
						filterResultSequence = this._filterExpression.evaluateMaybeStatically(
							dynamicContext.scopeWithFocus(i, iteratorItem.value, valuesToFilter),
							executionParameters
						);
					}

					const first = filterResultSequence.first();
					let shouldReturnCurrentValue: boolean;
					if (first === null) {
						// Actually empty, very falsy indeed
						// Continue to next
						shouldReturnCurrentValue = false;
					} else if (isSubtypeOf(first.type.kind, BaseType.XSNUMERIC)) {
						// Remember: XPath is one-based
						shouldReturnCurrentValue = first.value === i + 1;
					} else {
						const ebv = filterResultSequence.getEffectiveBooleanValue();
						shouldReturnCurrentValue = ebv;
					}
					// Prepare awaiting the next one
					filterResultSequence = null;
					const returnableValue = iteratorItem.value;
					iteratorItem = null;
					i++;
					if (shouldReturnCurrentValue) {
						return ready(returnableValue);
					}
					// Continue to the next one
				}

				return iteratorItem;
			},
		});
	}

	public getBucket() {
		return this._selector.getBucket();
	}
}

export default Filter;
