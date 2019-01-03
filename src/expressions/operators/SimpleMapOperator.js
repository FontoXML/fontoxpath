import Expression from '../Expression';
import Specificity from '../Specificity';
import SequenceFactory from '../dataTypes/SequenceFactory';
import DynamicContext from '../DynamicContext';

/**
 * @extends {Expression}
 */
class SimpleMapOperator extends Expression {
	/**
	 * Simple Map operator
	 * The simple map operator will evaluate expressions given in expression1 and use the results as context for
	 * evaluating all expressions in expression2. Returns a sequence with results from the evaluation of expression2.
	 * Order is undefined.
	 *
	 * @param  {!Expression}  expression1
	 * @param  {!Expression}  expression2
	 */
	constructor (expression1, expression2) {
		super(
			new Specificity({}).add(expression1.specificity),
			[expression1, expression2],
			{
				canBeStaticallyEvaluated: expression1.canBeStaticallyEvaluated && expression2.canBeStaticallyEvaluated
			});

		this._expression1 = expression1;
		this._expression2 = expression2;
	}

	evaluate (dynamicContext, executionParameters) {
		const sequence = this._expression1.evaluateMaybeStatically(dynamicContext, executionParameters);
		const childContextIterator = dynamicContext.createSequenceIterator(sequence);
		let childContext = null;
		let sequenceValueIterator = null;
		let done = false;
		return SequenceFactory.create({
			next: () => {
				while (!done) {
					if (!childContext) {
						childContext = childContextIterator.next();
						if (childContext.done) {
							done = true;
							return childContext;
						}
						if (!childContext.ready) {
							const returnableValue = childContext;
							childContext = null;
							return returnableValue;
						}

					}

					// Now that we have moved an item in the input, start generating mapped items
					if (!sequenceValueIterator) {
						sequenceValueIterator = this._expression2.evaluateMaybeStatically(/** @type {!DynamicContext} */(childContext.value), executionParameters);
					}
					const value = sequenceValueIterator.value.next();
					if (value.done) {
						sequenceValueIterator = null;
						// Move to next
						childContext = null;
						continue;
					}
					return value;
				}
			}
		});
	}
}

export default SimpleMapOperator;
