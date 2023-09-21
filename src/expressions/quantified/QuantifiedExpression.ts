import sequenceFactory from '../dataTypes/sequenceFactory';
import { SequenceType } from '../dataTypes/Value';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Expression from '../Expression';
import StaticContext from '../StaticContext';

type InClause = {
	name: { localName: string; namespaceURI: string; prefix: string };
	sourceExpr: Expression;
};

class QuantifiedExpression extends Expression {
	public _inClauseExpressions: Expression[];
	public _inClauseNames: { localName: string; namespaceURI: string; prefix: string }[];
	public _inClauseVariableNames: string[];
	public _quantifier: string;
	public _satisfiesExpr: Expression;

	constructor(
		quantifier: string,
		inClauses: InClause[],
		satisfiesExpr: Expression,
		type: SequenceType,
	) {
		const inClauseExpressions = inClauses.map((inClause) => inClause.sourceExpr);
		const inClauseNames = inClauses.map((inClause) => inClause.name);

		const specificity = inClauseExpressions.reduce(
			(summedSpecificity, inClause) => summedSpecificity.add(inClause.specificity),
			satisfiesExpr.specificity,
		);
		super(
			specificity,
			inClauseExpressions.concat(satisfiesExpr),
			{
				canBeStaticallyEvaluated: false,
			},
			false,
			type,
		);

		this._quantifier = quantifier;
		this._inClauseNames = inClauseNames;
		this._inClauseExpressions = inClauseExpressions;
		this._satisfiesExpr = satisfiesExpr;

		this._inClauseVariableNames = null;
	}

	public evaluate(dynamicContext: DynamicContext, executionParameters: ExecutionParameters) {
		let scopingContext = dynamicContext;
		const evaluatedInClauses = this._inClauseVariableNames.map((variableBinding, i: number) => {
			const allValuesInInClause = this._inClauseExpressions[i]
				.evaluateMaybeStatically(scopingContext, executionParameters)
				.getAllValues();
			scopingContext = dynamicContext.scopeWithVariableBindings({
				[variableBinding]: () => sequenceFactory.create(allValuesInInClause),
			});

			return allValuesInInClause;
		});

		// If any item of evaluatedInClauses is empty stop
		if (
			evaluatedInClauses.some((items) => {
				return items.length === 0;
			})
		) {
			return this._quantifier === 'every'
				? sequenceFactory.singletonTrueSequence()
				: sequenceFactory.singletonFalseSequence();
		}

		const indices = new Array(evaluatedInClauses.length).fill(0);
		indices[0] = -1;

		let hasOverflowed = true;
		while (hasOverflowed) {
			hasOverflowed = false;
			for (let i = 0, l = indices.length; i < l; ++i) {
				const valueArray = evaluatedInClauses[i];
				if (++indices[i] > valueArray.length - 1) {
					indices[i] = 0;
					continue;
				}

				const variables = Object.create(null);

				for (let y = 0; y < indices.length; y++) {
					const value = evaluatedInClauses[y][indices[y]];
					variables[this._inClauseVariableNames[y]] = () =>
						sequenceFactory.singleton(value);
				}

				const context = dynamicContext.scopeWithVariableBindings(variables);
				const result = this._satisfiesExpr.evaluateMaybeStatically(
					context,
					executionParameters,
				);

				if (result.getEffectiveBooleanValue() && this._quantifier === 'some') {
					return sequenceFactory.singletonTrueSequence();
				} else if (!result.getEffectiveBooleanValue() && this._quantifier === 'every') {
					return sequenceFactory.singletonFalseSequence();
				}
				hasOverflowed = true;
				break;
			}
		}

		// An every quantifier is true if all items match, a some is false if none of the items match
		return this._quantifier === 'every'
			? sequenceFactory.singletonTrueSequence()
			: sequenceFactory.singletonFalseSequence();
	}

	public performStaticEvaluation(staticContext: StaticContext) {
		this._inClauseVariableNames = [];
		for (let i = 0, l = this._inClauseNames.length; i < l; ++i) {
			const expr = this._inClauseExpressions[i];
			expr.performStaticEvaluation(staticContext);

			// The existance of this variable should be known for the next expression
			staticContext.introduceScope();
			const inClauseName = this._inClauseNames[i];
			const inClauseNameNamespaceURI = inClauseName.prefix
				? staticContext.resolveNamespace(inClauseName.prefix)
				: null;
			const varBindingName = staticContext.registerVariable(
				inClauseNameNamespaceURI,
				inClauseName.localName,
			);
			this._inClauseVariableNames[i] = varBindingName;
		}

		this._satisfiesExpr.performStaticEvaluation(staticContext);

		for (let i = 0, l = this._inClauseNames.length; i < l; ++i) {
			staticContext.removeScope();
		}
	}
}
export default QuantifiedExpression;
