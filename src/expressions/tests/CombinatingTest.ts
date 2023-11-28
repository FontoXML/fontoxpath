import Value from '../dataTypes/Value';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import {} from '../Expression';
import Specificity from '../Specificity';
import StaticContext from '../StaticContext';
import { Bucket, unionBucket } from '../util/Bucket';
import TestAbstractExpression from './TestAbstractExpression';

/**
 * Combinating test, used to process `descendant::(a|b|c)` selectors
 */
class CombinatingTest extends TestAbstractExpression {
	private _subTests: TestAbstractExpression[];
	private _bucket: Bucket;
	constructor(subTests: TestAbstractExpression[]) {
		const maxSpecificity = subTests.reduce<Specificity>((currentMaxSpecificity, selector) => {
			if (currentMaxSpecificity.compareTo(selector.specificity) > 0) {
				return currentMaxSpecificity;
			}
			return selector.specificity;
		}, new Specificity({}));

		super(maxSpecificity);

		// If all subExpressions define the same bucket: use that one, else, use no bucket.
		let bucket: Bucket | null;
		for (let i = 0; i < subTests.length; ++i) {
			const subTestBucket = subTests[i].getBucket();
			if (bucket === undefined) {
				bucket = subTestBucket;
			}
			if (bucket === null) {
				// Not applicable buckets
				break;
			}

			bucket = unionBucket(bucket, subTestBucket);
		}

		this._bucket = bucket;
		this._subTests = subTests;
	}

	public evaluateToBoolean(
		dynamicContext: DynamicContext,
		value: Value,
		executionParameters: ExecutionParameters,
	) {
		return this._subTests.some((test) => {
			const result = test.evaluateToBoolean(dynamicContext, value, executionParameters);
			return result;
		});
	}

	public override getBucket(): Bucket {
		return this._bucket;
	}

	public performStaticEvaluation(staticContext: StaticContext) {
		this._subTests.forEach((test) => test.performStaticEvaluation(staticContext));
	}
}

export default CombinatingTest;
