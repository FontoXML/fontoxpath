import Selector from '../Selector';
import Specificity from '../Specificity';
import Sequence from '../dataTypes/Sequence';

/**
 * @extends {Selector}
 */
class SimpleMapOperator extends Selector {
	/**
	 * Simple Map operator
	 * The simple map operator will evaluate expressions given in expression1 and use the results as context for
	 * evaluating all expressions in expression2. Returns a sequence with results from the evaluation of expression2.
	 * Order is undefined.
	 *
	 * @param  {!Selector}  expression1
	 * @param  {!Selector}  expression2
	 */
	constructor (expression1, expression2) {
		super(new Specificity({}).add(expression1.specificity));

		this._expression1 = expression1;
		this._expression2 = expression2;


	}

	evaluate (dynamicContext) {
		const sequence = this._expression1.evaluate(dynamicContext);
		const expression2 = this._expression2;
		const childContextIterator = dynamicContext.createSequenceIterator(sequence);
		let childContext = childContextIterator.next();
		let sequenceValueIterator = null;

		return new Sequence({
			next: () => {
				if (childContext.done) {
					return { done: true };
				}
				if (!sequenceValueIterator) {
					sequenceValueIterator = expression2.evaluate(childContext.value).value();
				}
				let value = sequenceValueIterator.next();
				while (value.done) {
					childContext = childContextIterator.next();
					if (childContext.done) {
						return { done: true };
					}
					sequenceValueIterator = expression2.evaluate(childContext.value).value();
					value = sequenceValueIterator.next();
				}
				return value;
			}
		});
	}
}

export default SimpleMapOperator;
