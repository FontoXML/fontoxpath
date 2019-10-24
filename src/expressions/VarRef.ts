import ISequence from './dataTypes/ISequence';
import DynamicContext from './DynamicContext';
import ExecutionParameters from './ExecutionParameters';
import Expression, { RESULT_ORDERINGS } from './Expression';
import Specificity from './Specificity';
import StaticContext from './StaticContext';

class VarRef extends Expression {
	private _namespaceURI: string;
	private _prefix: string;
	private _staticallyBoundVariableValue: Expression;
	private _variableBindingName: any;
	private _variableName: string;

	constructor(prefix: string, namespaceURI: string | null, variableName: string) {
		super(new Specificity({}), [], {
			canBeStaticallyEvaluated: false,
			resultOrder: RESULT_ORDERINGS.UNSORTED
		});

		this._variableName = variableName;
		this._namespaceURI = namespaceURI || undefined;
		this._prefix = prefix;

		this._variableBindingName = null;
	}

	public evaluate(dynamicContext: DynamicContext, executionParameters: ExecutionParameters) {
		const variableBinding =
			!this.canBeStaticallyEvaluated() &&
			dynamicContext.variableBindings[this._variableBindingName];
		// Make dynamic variables take precedence
		if (!variableBinding) {
			if (this._staticallyBoundVariableValue) {
				return this._staticallyBoundVariableValue.evaluateMaybeStatically(
					dynamicContext,
					executionParameters
				);
			}

			throw new Error(
				'XQDY0054: The variable ' + this._variableName + ' is declared but not in scope.'
			);
		}

		return dynamicContext.variableBindings[this._variableBindingName]();
	}

	public performStaticEvaluation(staticContext: StaticContext) {
		if (this._prefix) {
			this._namespaceURI = staticContext.resolveNamespace(this._prefix);
		}

		this._variableBindingName = staticContext.lookupVariable(
			this._namespaceURI || undefined,
			this._variableName
		);
		if (!this._variableBindingName) {
			throw new Error('XPST0008, The variable ' + this._variableName + ' is not in scope.');
		}

		const staticallyBoundVariableBinding = staticContext.getVariableExpression(
			this._variableBindingName
		);

		if (staticallyBoundVariableBinding) {
			this._staticallyBoundVariableValue = staticallyBoundVariableBinding;
			if (this._staticallyBoundVariableValue.canBeStaticallyEvaluated()) {
				this._canBeStaticallyEvaluated = true;
			}
		}
	}
}

export default VarRef;
