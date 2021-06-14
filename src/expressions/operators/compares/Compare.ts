import zipSingleton from '../../../expressions/util/zipSingleton';
import AtomicValue from '../../dataTypes/AtomicValue';
import atomize from '../../dataTypes/atomize';
import ISequence from '../../dataTypes/ISequence';
import sequenceFactory from '../../dataTypes/sequenceFactory';
import { SequenceType } from '../../dataTypes/Value';
import DynamicContext from '../../DynamicContext';
import ExecutionParameters from '../../ExecutionParameters';
import Expression from '../../Expression';
import generalCompare from './generalCompare';
import nodeCompare from './nodeCompare';
import valueCompare from './valueCompare';

class Compare extends Expression {
	private _compare: 'generalCompare' | 'valueCompare' | 'nodeCompare';
	private _evaluationFunction: (firstValue: AtomicValue, secondValue: AtomicValue) => boolean;
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
				break;
			case 'eqOp':
			case 'neOp':
			case 'ltOp':
			case 'leOp':
			case 'gtOp':
			case 'geOp':
				this._compare = 'valueCompare';

				if (firstType && secondType) {
					this._evaluationFunction = valueCompare(
						kind,
						firstType.type,
						secondType.type,
						null
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
		if (
			this._evaluationFunction &&
			firstSequence.getLength() === 1 &&
			secondSequence.getLength() === 1
		) {
			const firstAtomizedSequence = atomize(firstSequence, executionParameters);
			const secondAtomizedSequence = atomize(secondSequence, executionParameters);

			// Execute the evaluation function and return either a true- or false-sequence
			return this._evaluationFunction(
				firstAtomizedSequence.first(),
				secondAtomizedSequence.first()
			)
				? sequenceFactory.singletonTrueSequence()
				: sequenceFactory.singletonFalseSequence();
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
									return secondSequence.switchCases({
										default: () => {
											throw new Error(
												'XPTY0004: Sequences to compare are not singleton'
											);
										},
										singleton: () =>
											zipSingleton(
												[firstSequence, secondSequence],
												([first, second]) => {
													const compareFunction = nodeCompare(
														this._operator,
														executionParameters.domFacade,
														first.type,
														second.type
													);
													return compareFunction(first, second)
														? sequenceFactory.singletonTrueSequence()
														: sequenceFactory.singletonFalseSequence();
												}
											),
									});
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
												secondAtomizedSequence.mapAll(
													([onlySecondValue]) => {
														const compareFunction = valueCompare(
															this._operator,
															onlyFirstValue.type,
															onlySecondValue.type,
															dynamicContext
														);
														return compareFunction(
															onlyFirstValue,
															onlySecondValue
														)
															? sequenceFactory.singletonTrueSequence()
															: sequenceFactory.singletonFalseSequence();
													}
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
