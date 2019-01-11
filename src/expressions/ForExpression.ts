import Expression from './Expression';
import PossiblyUpdatingExpression from './PossiblyUpdatingExpression';
import SequenceFactory from './dataTypes/SequenceFactory';
import { DONE_TOKEN } from './util/iterators';

class ForExpression extends PossiblyUpdatingExpression {
	_prefix: string;
	_namespaceURI: string;
	_localName: string;
	_variableBindingKey: any;
	_clauseExpression: Expression;
	_returnExpression: Expression;

	constructor(
		rangeVariable: { prefix: string; namespaceURI: string | null; localName: string },
		clauseExpression: Expression,
		returnExpression: Expression
	) {
		super(
			clauseExpression.specificity.add(returnExpression.specificity),
			[clauseExpression, returnExpression],
			{
				canBeStaticallyEvaluated: false
			}
		);

		this._prefix = rangeVariable.prefix;
		this._namespaceURI = rangeVariable.namespaceURI;
		this._localName = rangeVariable.localName;

		this._variableBindingKey = null;

		this._clauseExpression = clauseExpression;
		this._returnExpression = returnExpression;
	}

	performStaticEvaluation(staticContext) {
		if (this._prefix) {
			this._namespaceURI = staticContext.resolveNamespace(this._prefix);

			if (!this._namespaceURI && this._prefix) {
				throw new Error(
					`XPST0081: Could not resolve namespace for prefix ${
						this._prefix
					} using in a for expression`
				);
			}
		}

		this._clauseExpression.performStaticEvaluation(staticContext);
		staticContext.introduceScope();
		this._variableBindingKey = staticContext.registerVariable(
			this._namespaceURI,
			this._localName
		);

		this._returnExpression.performStaticEvaluation(staticContext);
		staticContext.removeScope();
	}

	performFunctionalEvaluation(
		dynamicContext,
		executionParameters,
		[_createBindingSequence, createReturnExpression]
	) {
		const clauseIterator = this._clauseExpression.evaluateMaybeStatically(
			dynamicContext,
			executionParameters
		).value;
		let returnIterator = null;
		let done = false;
		return SequenceFactory.create({
			next: () => {
				while (!done) {
					if (returnIterator === null) {
						const currentClauseValue = clauseIterator.next();
						if (!currentClauseValue.ready) {
							return currentClauseValue;
						}
						if (currentClauseValue.done) {
							done = true;
							break;
						}

						const nestedContext = dynamicContext.scopeWithVariableBindings({
							[this._variableBindingKey]: () =>
								SequenceFactory.singleton(currentClauseValue.value)
						});

						returnIterator = createReturnExpression(nestedContext).value;
					}
					const returnValue = returnIterator.next();
					if (returnValue.done) {
						returnIterator = null;
						// Get the next one
						continue;
					}
					return returnValue;
				}
				return DONE_TOKEN;
			}
		});
	}
}

export default ForExpression;