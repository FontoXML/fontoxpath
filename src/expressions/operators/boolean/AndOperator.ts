import { NodePointer } from '../../../domClone/Pointer';
import { getBucketsForPointer } from '../../../getBuckets';
import { BaseType } from '../../dataTypes/BaseType';
import { falseBoolean, trueBoolean } from '../../dataTypes/createAtomicValue';
import ISequence from '../../dataTypes/ISequence';
import isSubtypeOf from '../../dataTypes/isSubtypeOf';
import sequenceFactory from '../../dataTypes/sequenceFactory';
import DynamicContext from '../../DynamicContext';
import ExecutionParameters from '../../ExecutionParameters';
import Expression from '../../Expression';
import Specificity from '../../Specificity';
import { DONE_TOKEN, ready } from '../../util/iterators';

class AndOperator extends Expression {
	private _subExpressions: Expression[];
	constructor(expressions: Expression[]) {
		super(
			expressions.reduce((specificity, selector) => {
				return specificity.add(selector.specificity);
			}, new Specificity({})),
			expressions,
			{
				canBeStaticallyEvaluated: expressions.every(
					(selector) => selector.canBeStaticallyEvaluated
				),
			}
		);
		this._subExpressions = expressions;
	}

	public evaluate(
		dynamicContext: DynamicContext,
		executionParameters: ExecutionParameters
	): ISequence {
		let i = 0;
		let resultSequence: ISequence = null;
		let done = false;
		let contextItemBuckets: string[] | null = null;
		if (dynamicContext !== null) {
			const contextItem = dynamicContext.contextItem;
			if (contextItem !== null && isSubtypeOf(contextItem.type.kind, BaseType.NODE)) {
				contextItemBuckets = getBucketsForPointer(
					contextItem.value as NodePointer,
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
									done = true;
									return ready(falseBoolean);
								}
							}
							resultSequence = subExpression.evaluateMaybeStatically(
								dynamicContext,
								executionParameters
							);
						}
						const ebv = resultSequence.getEffectiveBooleanValue();
						if (ebv === false) {
							done = true;
							return ready(falseBoolean);
						}
						resultSequence = null;
						i++;
					}
					done = true;
					return ready(trueBoolean);
				}
				return DONE_TOKEN;
			},
		});
	}

	public getBucket() {
		// Any bucket of our subexpressions should do, and is preferable to no bucket
		for (let i = 0, l = this._subExpressions.length; i < l; ++i) {
			const bucket = this._subExpressions[i].getBucket();
			if (bucket) {
				return bucket;
			}
		}
		return null;
	}
}
export default AndOperator;
