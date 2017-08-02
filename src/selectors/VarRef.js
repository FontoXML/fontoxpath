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
		super(new Specificity({}), {
			canBeStaticallyEvaluated: false,
			resultOrder: Selector.RESULT_ORDERINGS.UNSORTED
		});
		if (prefix || namespaceURI) {
			throw new Error('Not implemented: references to variables with a namespace URI or a prefix.');
		}

		this._variableName = variableName;

	}

	evaluate (dynamicContext) {
		var value = dynamicContext.variables[this._variableName];
		if (!value) {
			throw new Error('XPST0008, The variable ' + this._variableName + ' is not in scope.');
		}

		return value();
	}
}

export default VarRef;
