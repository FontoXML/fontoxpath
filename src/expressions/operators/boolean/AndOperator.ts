import { NodePointer } from '../../../domClone/Pointer';
import { getBucketsForPointer } from '../../../getBuckets';
import { falseBoolean, trueBoolean } from '../../dataTypes/createAtomicValue';
import ISequence from '../../dataTypes/ISequence';
import isSubtypeOf from '../../dataTypes/isSubtypeOf';
import sequenceFactory from '../../dataTypes/sequenceFactory';
import { SequenceType, ValueType } from '../../dataTypes/Value';
import DynamicContext from '../../DynamicContext';
import ExecutionParameters from '../../ExecutionParameters';
import Expression from '../../Expression';
import Specificity from '../../Specificity';
import { DONE_TOKEN, ready } from '../../util/iterators';

function intersectBuckets(bucket1: string | null, bucket2: string | null): string | null {
	// null bucket applies to everything
	if (bucket1 === null) {
		return bucket2;
	}
	if (bucket2 === null) {
		return bucket1;
	}
	// empty bucket applies to nothing
	if (bucket1 === 'empty' || bucket2 === 'empty') {
		return 'empty';
	}
	// Same bucket is same
	if (bucket1 === bucket2) {
		return bucket1;
	}

	if (bucket1.startsWith('name-')) {
		// Name bucket always refers to an element or attribute
		if (bucket2 === 'type-1' || bucket2 === 'type-1-or-type-2' || bucket2 === 'type-2') {
			// A name is more specific than a type
			return bucket1;
		}
		// Even if bucket2 is a name, we know it's not equal, so intersection is empty
		return 'empty';
	}

	if (bucket1 === 'type-1-or-type-2' && (bucket2 === 'type-1' || bucket2 === 'type-2')) {
		return bucket2;
	}
	if (bucket2 === 'type-1-or-type-2' && (bucket1 === 'type-1' || bucket1 === 'type-2')) {
		return bucket1;
	}

	// Can't match anything
	return 'empty';
}

class AndOperator extends Expression {
	private _subExpressions: Expression[];
	constructor(expressions: Expression[], type: SequenceType) {
		super(
			expressions.reduce((specificity, selector) => {
				return specificity.add(selector.specificity);
			}, new Specificity({})),
			expressions,
			{
				canBeStaticallyEvaluated: expressions.every(
					(selector) => selector.canBeStaticallyEvaluated
				),
			},
			false,
			type
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
			if (contextItem !== null && isSubtypeOf(contextItem.type, ValueType.NODE)) {
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
		return this._subExpressions.reduce<string | null>(
			(bucket, expression) => intersectBuckets(bucket, expression.getBucket()),
			null
		);
	}
}
export default AndOperator;
