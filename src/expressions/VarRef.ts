import Expression from './Expression';
import Specificity from './Specificity';

/**
 * @extends {Expression}
 */
class VarRef extends Expression {
	_variableName: string;
	_namespaceURI: string;
	_prefix: string;
	_variableBindingName: any;
	/**
	 * @param  {string}  prefix
	 * @param  {?string}  namespaceURI
	 * @param  {string}  variableName
	 */
	constructor (prefix: string, namespaceURI: string | null, variableName: string) {
		super(
			new Specificity({}),
			[],
			{
				canBeStaticallyEvaluated: false,
				resultOrder: Expression.RESULT_ORDERINGS.UNSORTED
			});
		if (prefix || namespaceURI) {
			throw new Error('Not implemented: references to variables with a namespace URI or a prefix.');
		}

		this._variableName = variableName;
		this._namespaceURI = namespaceURI;
		this._prefix = prefix;

		this._variableBindingName = null;
	}

	performStaticEvaluation (staticContext) {
		if (this._prefix) {
			this._namespaceURI = staticContext.resolveNamespace(this._prefix);
		}

		this._variableBindingName = staticContext.lookupVariable(this._namespaceURI, this._variableName);
		if (!this._variableBindingName) {
			throw new Error('XPST0008, The variable ' + this._variableName + ' is not in scope.');
		}
	}

	evaluate (dynamicContext, _executionParameters) {
		const variableBinding = dynamicContext.variableBindings[this._variableBindingName];
		if (!variableBinding) {
			throw new Error('XQDY0054: The variable ' + this._variableName + ' is declared but not in scope.');
		}

		return dynamicContext.variableBindings[this._variableBindingName]();
	}
}

export default VarRef;
