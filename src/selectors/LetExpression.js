import Selector from './Selector';
import Sequence from './dataTypes/Sequence';

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
			{
				resultOrder: returnExpression.expectedResultOrder,
				subtree: returnExpression.subtree,
				peer: returnExpression.peer,
				canBeStaticallyEvaluated: false
			});

		this._rangeVariable = rangeVariable;
		this._bindingSequence = bindingSequence;
		this._returnExpression = returnExpression;
	}

	evaluate (dynamicContext) {
		const newVariables = Object.create(null);
		const variable = this._bindingSequence.evaluateMaybeStatically(dynamicContext);
		// Copy the variable to prevent evaluating it
		// This caused bugs with XPaths like `let $x := (1,2,3) return count($x) * count($x)`
		newVariables[this._rangeVariable] = new Sequence(variable.getAllValues());
		return this._returnExpression.evaluateMaybeStatically(
			dynamicContext.scopeWithVariables(newVariables));
	}
}
export default LetExpression;
