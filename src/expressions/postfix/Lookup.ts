import EmptySequence from '../dataTypes/Sequences/EmptySequence';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Expression from '../Expression';
import { Bucket } from '../util/Bucket';
import evaluateLookup from './evaluateLookup';

class Lookup extends Expression {
	private readonly _keySpecifier: '*' | Expression;
	private readonly _selector: Expression;

	constructor(selector: Expression, keySpecifier: '*' | Expression) {
		super(selector.specificity, [selector].concat(keySpecifier === '*' ? [] : [keySpecifier]), {
			canBeStaticallyEvaluated: selector.canBeStaticallyEvaluated,
			resultOrder: selector.expectedResultOrder,
			subtree: selector.subtree,
		});

		this._selector = selector;
		this._keySpecifier = keySpecifier;
	}

	public evaluate(dynamicContext: DynamicContext, executionParameters: ExecutionParameters) {
		const sequence = this._selector.evaluateMaybeStatically(
			dynamicContext,
			executionParameters
		);
		return sequence.mapAll((items) => {
			return items.reduce((toReturn, item) => {
				return evaluateLookup(
					item,
					this._keySpecifier,
					toReturn,
					dynamicContext,
					executionParameters
				);
			}, new EmptySequence());
		});
	}

	public override getBucket(): Bucket | null {
		return this._selector.getBucket();
	}
}

export default Lookup;
