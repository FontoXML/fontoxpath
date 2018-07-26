import Selector from './Selector';
import Specificity from './Specificity';

/**
 * @extends {Selector}
 */
class VarRef extends Selector {
	/**
	 * @param  {string}  prefix
	 * @param  {string}  namespaceURI
	 * @param  {string}  variableName
	 */
	constructor (prefix, namespaceURI, variableName) {
		super(
			new Specificity({}),
			[],
			{
				canBeStaticallyEvaluated: false,
				resultOrder: Selector.RESULT_ORDERINGS.UNSORTED
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
		if (this.prefix) {
			this._namespaceURI = staticContext.resolveNamespace(this._prefix);
		}

		this._variableBindingName = staticContext.lookupVariable(this._namespaceURI, this._variableName);
		if (!this._variableBindingName) {
			throw new Error('XPST0008, The variable ' + this._variableName + ' is not in scope.');
		}
	}

	evaluate (dynamicContext, executionParameters) {
		return dynamicContext.variableBindings[this._variableBindingName](executionParameters);
	}
}

export default VarRef;
