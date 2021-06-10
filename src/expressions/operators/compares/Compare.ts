import atomize from '../../dataTypes/atomize';
import ISequence from '../../dataTypes/ISequence';
import sequenceFactory from '../../dataTypes/sequenceFactory';
import { SequenceMultiplicity, SequenceType } from '../../dataTypes/Value';
import DynamicContext from '../../DynamicContext';
import ExecutionParameters from '../../ExecutionParameters';
import Expression from '../../Expression';
import generalCompare, { generatePrefabFunction } from './generalCompare';
import nodeCompare from './nodeCompare';
import valueCompare from './valueCompare';

class Compare extends Expression {
	private _compare: 'generalCompare' | 'valueCompare' | 'nodeCompare';
	private _firstExpression: Expression;
	private _operator: string;
	private _secondExpression: Expression;
	private _firstType: SequenceType;
	private _secondType: SequenceType;
	private _evaluationFunction: (
		firstSequence: ISequence,
		secondSequence: ISequence,
		context: DynamicContext,
		parameters: ExecutionParameters
	) => ISequence;

	constructor(
		kind: string,
		firstExpression: Expression,
		secondExpression: Expression,
		firstType: SequenceType,
		secondType: SequenceType
	) {
		super(
			firstExpression.specificity.add(secondExpression.specificity),
			[firstExpression, secondExpression],
			{
				canBeStaticallyEvaluated: false,
			}
		);
		this._firstExpression = firstExpression;
		this._secondExpression = secondExpression;
		this._firstType = firstType;
		this._secondType = secondType;

		switch (kind) {
			case 'equalOp':
			case 'notEqualOp':
			case 'lessThanOrEqualOp':
			case 'lessThanOp':
			case 'greaterThanOrEqualOp':
			case 'greaterThanOp':
				this._compare = 'generalCompare';
				if (
					firstType &&
					secondType &&
					firstType.mult === SequenceMultiplicity.EXACTLY_ONE &&
					secondType.mult === SequenceMultiplicity.EXACTLY_ONE
				) {
					this._evaluationFunction = generatePrefabFunction(
						kind,
						firstType.type,
						secondType.type
					);
				}

				break;
			case 'eqOp':
			case 'neOp':
			case 'ltOp':
			case 'leOp':
			case 'gtOp':
			case 'geOp':
				this._compare = 'valueCompare';

				this._evaluationFunction = null;

				break;
			default:
				this._compare = 'nodeCompare';
		}

		this._operator = kind;
	}

	public evaluate(dynamicContext: DynamicContext, executionParameters: ExecutionParameters) {
		const firstSequence = this._firstExpression.evaluateMaybeStatically(
			dynamicContext,
			executionParameters
		);
		const secondSequence = this._secondExpression.evaluateMaybeStatically(
			dynamicContext,
			executionParameters
		);

		if (this._evaluationFunction) {
			return this._evaluationFunction(
				firstSequence,
				secondSequence,
				dynamicContext,
				executionParameters
			);
		}

		return firstSequence.switchCases({
			empty: () => {
				if (this._compare === 'valueCompare' || this._compare === 'nodeCompare') {
					return sequenceFactory.empty();
				}
				return sequenceFactory.singletonFalseSequence();
			},
			default: () =>
				secondSequence.switchCases({
					empty: () => {
						if (this._compare === 'valueCompare' || this._compare === 'nodeCompare') {
							return sequenceFactory.empty();
						}
						return sequenceFactory.singletonFalseSequence();
					},
					default: () => {
						if (this._compare === 'nodeCompare') {
							return nodeCompare(
								this._operator,
								executionParameters.domFacade,
								firstSequence,
								secondSequence
							);
						}

						// Atomize both sequences
						const firstAtomizedSequence = atomize(firstSequence, executionParameters);
						const secondAtomizedSequence = atomize(secondSequence, executionParameters);

						if (this._compare === 'valueCompare') {
							return firstAtomizedSequence.switchCases({
								singleton: () =>
									secondAtomizedSequence.switchCases({
										singleton: () =>
											firstAtomizedSequence.mapAll(([onlyFirstValue]) =>
												secondAtomizedSequence.mapAll(([onlySecondValue]) =>
													valueCompare(
														this._operator,
														onlyFirstValue,
														onlySecondValue,
														dynamicContext
													)
														? sequenceFactory.singletonTrueSequence()
														: sequenceFactory.singletonFalseSequence()
												)
											),
										default: () => {
											throw new Error(
												'XPTY0004: Sequences to compare are not singleton.'
											);
										},
									}),
								default: () => {
									throw new Error(
										'XPTY0004: Sequences to compare are not singleton.'
									);
								},
							});
						}
						// Only generalCompare left
						return generalCompare(
							this._operator,
							firstAtomizedSequence,
							secondAtomizedSequence,
							dynamicContext
						);
					},
				}),
		});
	}
}

export default Compare;
