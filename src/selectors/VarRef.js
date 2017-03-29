import Selector from './Selector';
import Specificity from './Specificity';

/**
 * @extends {Selector}
 */
class VarRef extends Selector {
	/**
	 * @param  {string}  variableName
	 */
	constructor (variableName) {
		super(new Specificity({}), Selector.RESULT_ORDERINGS.UNSORTED);

		this._variableName = variableName;
	}

	evaluate (dynamicContext) {
		var value = dynamicContext.variables[this._variableName];
		if (!value) {
			throw new Error('XPST0008, The variable ' + this._variableName + ' is not in scope.');
		}

		return value;
	}
}

export default VarRef;
