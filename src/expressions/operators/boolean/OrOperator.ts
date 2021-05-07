import { ValueType } from '../../dataTypes/Value';
import { getBucketsForPointer } from '../../../getBuckets';
import { falseBoolean, trueBoolean } from '../../dataTypes/createAtomicValue';
import ISequence from '../../dataTypes/ISequence';
import isSubtypeOf from '../../dataTypes/isSubtypeOf';
import sequenceFactory from '../../dataTypes/sequenceFactory';
import Expression from '../../Expression';
import Specificity from '../../Specificity';
import { DONE_TOKEN, ready } from '../../util/iterators';

class OrOperator extends Expression {
	private _bucket: string;
	private _subExpressions: Expression[];

	constructor(expressions: Expression[]) {
		const maxSpecificity = expressions.reduce((currentMaxSpecificity, selector) => {
			if (currentMaxSpecificity.compareTo(selector.specificity) > 0) {
				return currentMaxSpecificity;
			}
			return selector.specificity;
		}, new Specificity({}));

		super(maxSpecificity, expressions, {
			canBeStaticallyEvaluated: expressions.every(
				(selector) => selector.canBeStaticallyEvaluated
			),
		});

		// If all subExpressions define the same bucket: use that one, else, use no bucket.
		let bucket: string;
		for (let i = 0; i < expressions.length; ++i) {
			if (bucket === undefined) {
				bucket = expressions[i].getBucket();
			}
			if (bucket === null) {
				// Not applicable buckets
				break;
			}

			if (bucket !== expressions[i].getBucket()) {
				bucket = null;
				break;
			}
		}
		this._bucket = bucket;

		this._subExpressions = expressions;
	}

	public evaluate(dynamicContext, executionParameters) {
		let i = 0;
		let resultSequence: ISequence = null;
		let done = false;

		let contextItemBuckets = null;
		if (dynamicContext !== null) {
			const contextItem = dynamicContext.contextItem;
			if (contextItem !== null && isSubtypeOf(contextItem.type, ValueType.NODE)) {
				contextItemBuckets = getBucketsForPointer(
					contextItem.value,
					executionParameters.domFacade
				);
			}
		}

		return sequenceFactory.create({
			next: () => {
				if (!done) {
					while (i < this._subExpressions.length) {
						if (!resultSequence) {
							const subExpression = this._subExpressions[i];
							if (contextItemBuckets !== null && subExpression.getBucket() !== null) {
								if (!contextItemBuckets.includes(subExpression.getBucket())) {
									// This subExpression may NEVER match the given node
									// We do not even have to evaluate the expression
									i++;
									continue;
								}
							}
							resultSequence = subExpression.evaluateMaybeStatically(
								dynamicContext,
								executionParameters
							);
						}
						const ebv = resultSequence.getEffectiveBooleanValue();
						if (ebv === true) {
							done = true;
							return ready(trueBoolean);
						}
						resultSequence = null;
						i++;
					}
					done = true;
					return ready(falseBoolean);
				}
				return DONE_TOKEN;
			},
		});
	}

	public getBucket() {
		return this._bucket;
	}
}

export default OrOperator;
