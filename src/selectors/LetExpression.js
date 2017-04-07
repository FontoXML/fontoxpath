import Selector from './Selector';
/**
 * @extends {Selector}
 */
class LetExpression extends Selector {
	/**
	 * @param  {string}    rangeVariable
	 * @param  {Selector}  bindingSequence
	 * @param  {Selector}  returnExpression
	 */
	constructor (rangeVariable, bindingSequence, returnExpression) {
		super(
			bindingSequence.specificity.add(returnExpression.specificity),
			returnExpression.expectedResultOrder);

		this._rangeVariable = rangeVariable;
		this._bindingSequence = bindingSequence;
		this._returnExpression = returnExpression;
	}

	toString () {
		return `(let ${this._rangeVariable} ${this._bindingSequence.toString()} ${this._returnExpression.toString()})`;
	}

	evaluate (dynamicContext) {
		var newVariables = Object.create(null);
		newVariables[this._rangeVariable] = this._bindingSequence.evaluate(dynamicContext);
		return this._returnExpression.evaluate(
			dynamicContext.createScopedContext({
				variables: newVariables
			}));
	}
}
export default LetExpression;
