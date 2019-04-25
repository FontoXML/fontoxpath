import ISequence from './dataTypes/ISequence';
import sequenceFactory from './dataTypes/sequenceFactory';
import Value from './dataTypes/Value';
import DynamicContext from './DynamicContext';
import ExecutionParameters from './ExecutionParameters';
import Expression from './Expression';
import PossiblyUpdatingExpression from './PossiblyUpdatingExpression';
import StaticContext from './StaticContext';
import { AsyncIterator, DONE_TOKEN, IterationHint } from './util/iterators';

class ForExpression extends PossiblyUpdatingExpression {
	private _clauseExpression: Expression;
	private _localName: string;
	private _namespaceURI: string;
	private _prefix: string;
	private _returnExpression: Expression;
	private _variableBindingKey: string | null;

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
		dynamicContext: DynamicContext,
		executionParameters: ExecutionParameters,
		[_createBindingSequence, createReturnExpression]: ((
			dynamicContext: DynamicContext
		) => ISequence)[]
	) {
		const clauseIterator = this._clauseExpression.evaluateMaybeStatically(
			dynamicContext,
			executionParameters
		).value;
		let returnIterator: AsyncIterator<Value> | null = null;
		let done = false;
		return sequenceFactory.create({
			next: (hint: IterationHint) => {
				while (!done) {
					if (returnIterator === null) {
						const currentClauseValue = clauseIterator.next(IterationHint.NONE);
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
					const returnValue = returnIterator.next(hint);
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

	public performStaticEvaluation(staticContext: StaticContext) {
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
