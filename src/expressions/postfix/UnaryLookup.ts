import EmptySequence from '../dataTypes/Sequences/EmptySequence';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Expression from '../Expression';
import Specificity from '../Specificity';
import evaluateLookup from './evaluateLookup';

class UnaryLookup extends Expression {
	private readonly _keySpecifier: '*' | Expression;

	constructor(keySpecifier: '*' | Expression) {
		super(
			new Specificity({
				[Specificity.EXTERNAL_KIND]: 1,
			}),
			keySpecifier === '*' ? [] : [keySpecifier],
			{ canBeStaticallyEvaluated: false }
		);

		this._keySpecifier = keySpecifier;
	}

	public evaluate(dynamicContext: DynamicContext, executionParameters: ExecutionParameters) {
		return evaluateLookup(
			dynamicContext.contextItem,
			this._keySpecifier,
			new EmptySequence(),
			dynamicContext,
			executionParameters
		);
	}
}

export default UnaryLookup;
