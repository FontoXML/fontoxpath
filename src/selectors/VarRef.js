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
				canBeStaticallyEvaluated: true,
				resultOrder: Selector.RESULT_ORDERINGS.UNSORTED
			});
		if (prefix || namespaceURI) {
			throw new Error('Not implemented: references to variables with a namespace URI or a prefix.');
		}

		this._variableName = variableName;
		this._namespaceURI = namespaceURI;
		this._prefix = prefix;

		this._variableBinding = null;
	}

	performStaticEvaluation (staticContext) {
		// TODO: Namespaces
		this._variableBinding = staticContext.lookupVariable(this._prefix, this._namespaceURI, this._variableName);
		if (!this._variableBinding) {
			throw new Error('XPST0008, The variable ' + this._variableName + ' is not in scope.');
		}
	}

	evaluate (dynamicContext, executionParameters) {
		return dynamicContext.variableBindings[this._variableBinding](executionParameters);
	}
}

export default VarRef;
