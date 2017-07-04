import Selector from './Selector';
import Sequence from './dataTypes/Sequence';
import Specificity from './Specificity';

function buildVarName ({ prefix, namespaceURI, name }) {
	if (namespaceURI) {
		throw new Error('Not implemented: for expressions with a namespace URI in the binding.');
	}
	return prefix ? `${prefix}:${name}` : name;
}

/**
 * @extends {Selector}
 */
class ForExpression extends Selector {
	/**
	 * @param  {!Array<!{varName:{prefix:string, namespaceURI:string, name:string}, expression}>}  clauses
	 * @param  {!Selector}                       expression
	 */
	constructor (clauses, expression) {
		super(new Specificity({}), {
			canBeStaticallyEvaluated: false
		});

		this._clauses = clauses
			.map(({varName, expression}) => ({varName: buildVarName(varName), expression}));
		this._expression = expression;

	}

	evaluate (dynamicContext) {
		const resultStack = [{
			context: dynamicContext,
			varName: this._clauses[0].varName,
			resultIterator: this._clauses[0].expression.evaluateMaybeStatically(dynamicContext).value()
		}];
		let expressionResultIterator = null;

		return new Sequence({
			next: () => {
				while (resultStack.length) {
					while (resultStack.length < this._clauses.length) {
						// Building phase
						const previousVariableIterator = resultStack[0].resultIterator;
						const previousVarName = resultStack[0].varName;
						const previousContext = resultStack[0].context;
						const value = previousVariableIterator.next();
						if (!value.ready) {
							return value;
						}
						if (value.done) {
							resultStack.shift();
							if (!resultStack.length) {
								return { done: true, ready: true };
							}
							continue;
						}
						const contextWithVars = previousContext.scopeWithVariables({ [previousVarName]: Sequence.singleton(value) });
						resultStack.shift({
							context: contextWithVars,
							resultSequence: this._clauses[0].evaluateMaybeStatically(contextWithVars)
						});
					}
					if (!expressionResultIterator) {
						const nextValue = resultStack[0].resultIterator.next();
						if (!nextValue.ready) {
							return nextValue;
						}
						if (nextValue.done) {
							resultStack.shift();
							continue;
						}
						expressionResultIterator = this._expression.evaluateMaybeStatically(
							resultStack[0].context.scopeWithVariables(
								{ [resultStack[0].varName]:  Sequence.singleton(nextValue.value) }
							));
					}
					// Scanning for result / Result yielding phase
					const yieldableValue = expressionResultIterator.next();
					if (yieldableValue.done) {
						// Done with this result, better luck next time
						expressionResultIterator = null;
						continue;
					}
					return yieldableValue;
				}
				return { ready: true, done: true };
			}
		});
	}
}

export default ForExpression;
