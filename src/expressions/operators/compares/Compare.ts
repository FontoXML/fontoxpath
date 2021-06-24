import zipSingleton from '../../../expressions/util/zipSingleton';
import atomize from '../../dataTypes/atomize';
import ISequence from '../../dataTypes/ISequence';
import sequenceFactory from '../../dataTypes/sequenceFactory';
import Value, { SequenceMultiplicity, SequenceType, ValueType } from '../../dataTypes/Value';
import DynamicContext from '../../DynamicContext';
import ExecutionParameters from '../../ExecutionParameters';
import Expression from '../../Expression';
import generalCompare, { getGeneralCompareEvaluationFunction } from './generalCompare';
import nodeCompare from './nodeCompare';
import valueCompare, { getValueCompareEvaluationFunction } from './valueCompare';

class Compare extends Expression {
	private _compare: 'generalCompare' | 'valueCompare' | 'nodeCompare';
	private _evaluationFunction: (
		firstSequence: ISequence,
		secondSequence: ISequence,
		context: DynamicContext
	) => boolean;
	private _firstExpression: Expression;
	private _operator: string;
	private _secondExpression: Expression;

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

		switch (kind) {
			case 'equalOp':
			case 'notEqualOp':
			case 'lessThanOrEqualOp':
			case 'lessThanOp':
			case 'greaterThanOrEqualOp':
			case 'greaterThanOp':
				this._compare = 'generalCompare';
				const genericTypes = [
					ValueType.ITEM,
					ValueType.ARRAY,
					ValueType.XSANYATOMICTYPE,
					ValueType.NODE,
				];
				if (
					firstType &&
					secondType &&
					!genericTypes.includes(firstType.type) &&
					!genericTypes.includes(secondType.type)
				) {
					if (
						firstType.mult === SequenceMultiplicity.EXACTLY_ONE &&
						secondType.mult === SequenceMultiplicity.EXACTLY_ONE
					) {
						this._evaluationFunction = getValueCompareEvaluationFunction(
							kind,
							firstType.type,
							secondType.type
						);
					} else {
						this._evaluationFunction = getGeneralCompareEvaluationFunction(
							kind,
							firstType,
							secondType
						);
					}
				}

				break;
			case 'eqOp':
			case 'neOp':
			case 'ltOp':
			case 'leOp':
			case 'gtOp':
			case 'geOp':
				this._compare = 'valueCompare';

				if (firstType && secondType) {
					this._evaluationFunction = getValueCompareEvaluationFunction(
						kind,
						firstType.type,
						secondType.type
					);
				}

				break;
			default:
				this._compare = 'nodeCompare';

				if (firstType && secondType) {
					this._evaluationFunction = nodeCompare(
						kind,
						undefined,
						firstType.type,
						secondType.type
					);
				}
		}

		this._operator = kind;
	}

	public evaluate(
		dynamicContext: DynamicContext,
		executionParameters: ExecutionParameters
	): ISequence {
		const firstSequence = this._firstExpression.evaluateMaybeStatically(
			dynamicContext,
			executionParameters
		);
		const secondSequence = this._secondExpression.evaluateMaybeStatically(
			dynamicContext,
			executionParameters
		);

		// If we have an evaluation function stored we can execute that immediately
		// and make sure both sequences are of length 1
		if (this._evaluationFunction) {
			// Execute the evaluation function and return either a true- or false-sequence
			if (this._compare === 'nodeCompare') {
				if (firstSequence.isEmpty() || secondSequence.isEmpty()) {
					return sequenceFactory.empty();
				}
				// Node compares should not be atomized
				return this._evaluationFunction(firstSequence, secondSequence, dynamicContext)
					? sequenceFactory.singletonTrueSequence()
					: sequenceFactory.singletonFalseSequence();
			} else {
				const firstAtomizedSequence = atomize(firstSequence, executionParameters);
				const secondAtomizedSequence = atomize(secondSequence, executionParameters);
				if (firstAtomizedSequence.isEmpty() || secondAtomizedSequence.isEmpty()) {
					if (this._compare === 'valueCompare') {
						return sequenceFactory.empty();
					} else {
						return sequenceFactory.singletonFalseSequence();
					}
				}
				return this._evaluationFunction(
					firstAtomizedSequence,
					secondAtomizedSequence,
					dynamicContext
				)
					? sequenceFactory.singletonTrueSequence()
					: sequenceFactory.singletonFalseSequence();
			}
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
							return firstSequence.switchCases({
								default: () => {
									throw new Error(
										'XPTY0004: Sequences to compare are not singleton'
									);
								},
								singleton: () => {
									return this.nodeCompareSingletonHandler(
										firstSequence,
										secondSequence,
										executionParameters,
										dynamicContext
									);
								},
							});
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
													this.valueCompareSingletonHandler(
														onlyFirstValue,
														onlySecondValue,
														dynamicContext
													)
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

	private nodeCompareSingletonHandler(
		firstSequence: ISequence,
		secondSequence: ISequence,
		executionParameters: ExecutionParameters,
		dynamicContext: DynamicContext
	): ISequence {
		return secondSequence.switchCases({
			default: () => {
				throw new Error('XPTY0004: Sequences to compare are not singleton');
			},
			singleton: () =>
				zipSingleton([firstSequence, secondSequence], ([first, second]) => {
					const compareFunction = nodeCompare(
						this._operator,
						executionParameters.domFacade,
						first.type,
						second.type
					);
					return compareFunction(firstSequence, secondSequence, dynamicContext)
						? sequenceFactory.singletonTrueSequence()
						: sequenceFactory.singletonFalseSequence();
				}),
		});
	}

	private valueCompareSingletonHandler(
		onlyFirstValue: Value,
		onlySecondValue: Value,
		dynamicContext: DynamicContext
	): ISequence {
		const compareFunction = valueCompare(
			this._operator,
			onlyFirstValue.type,
			onlySecondValue.type
		);
		return compareFunction(onlyFirstValue, onlySecondValue, dynamicContext)
			? sequenceFactory.singletonTrueSequence()
			: sequenceFactory.singletonFalseSequence();
	}
}

export default Compare;
