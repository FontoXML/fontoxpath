import sequenceFactory from './dataTypes/sequenceFactory';
import Expression from './Expression';
import PossiblyUpdatingExpression from './PossiblyUpdatingExpression';
import { DONE_TOKEN } from './util/iterators';

class ForExpression extends PossiblyUpdatingExpression {
	private _clauseExpression: Expression;
	private _localName: string;
	private _namespaceURI: string;
	private _prefix: string;
	private _returnExpression: Expression;
	private _variableBindingKey: any;

	constructor(
		rangeVariable: { localName: string; namespaceURI: string | null; prefix: string },
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

	public performFunctionalEvaluation(
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
		return sequenceFactory.create({
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
								sequenceFactory.singleton(currentClauseValue.value)
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

	public performStaticEvaluation(staticContext) {
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
}

export default ForExpression;
