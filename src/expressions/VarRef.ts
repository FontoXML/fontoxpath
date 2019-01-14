import Expression, { RESULT_ORDERINGS } from './Expression';
import Specificity from './Specificity';

class VarRef extends Expression {
	private _namespaceURI: string;
	private _prefix: string;
	private _variableBindingName: any;
	private _variableName: string;

	constructor(prefix: string, namespaceURI: string | null, variableName: string) {
		super(new Specificity({}), [], {
			canBeStaticallyEvaluated: false,
			resultOrder: RESULT_ORDERINGS.UNSORTED
		});
		if (prefix || namespaceURI) {
			throw new Error(
				'Not implemented: references to variables with a namespace URI or a prefix.'
			);
		}

		this._variableName = variableName;
		this._namespaceURI = namespaceURI;
		this._prefix = prefix;

		this._variableBindingName = null;
	}

	public evaluate(dynamicContext, _executionParameters) {
		const variableBinding = dynamicContext.variableBindings[this._variableBindingName];
		if (!variableBinding) {
			throw new Error(
				'XQDY0054: The variable ' + this._variableName + ' is declared but not in scope.'
			);
		}

		return dynamicContext.variableBindings[this._variableBindingName]();
	}

	public performStaticEvaluation(staticContext) {
		if (this._prefix) {
			this._namespaceURI = staticContext.resolveNamespace(this._prefix);
		}

		this._variableBindingName = staticContext.lookupVariable(
			this._namespaceURI,
			this._variableName
		);
		if (!this._variableBindingName) {
			throw new Error('XPST0008, The variable ' + this._variableName + ' is not in scope.');
		}
	}
}

export default VarRef;
