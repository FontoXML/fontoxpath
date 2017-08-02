import Selector from './Selector';
import createDoublyIterableSequence from './util/createDoublyIterableSequence';

/**
 * @extends {Selector}
 */
class LetExpression extends Selector {
	/**
	 * @param  {{prefix:string, namespaceURI:string, name}}    rangeVariable
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

		if (rangeVariable.prefix || rangeVariable.namespaceURI) {
			throw new Error('Not implemented: let expressions with namespace usage.');
		}

		this._rangeVariable = rangeVariable.name;
		this._bindingSequence = bindingSequence;
		this._returnExpression = returnExpression;
	}

	evaluate (dynamicContext) {
		const newVariables = Object.create(null);
		const variable = this._bindingSequence.evaluateMaybeStatically(dynamicContext);
		// Because we might iterate it multiple times in the return expression,
		//   we need to save all of the values given by the expresion...
		newVariables[this._rangeVariable] = createDoublyIterableSequence(variable);
		return this._returnExpression.evaluateMaybeStatically(
			dynamicContext.scopeWithVariables(newVariables));
	}
}
export default LetExpression;
