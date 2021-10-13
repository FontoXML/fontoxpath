import { DONE_TOKEN } from '../../../expressions/util/iterators';
import { atomizeSingleValue } from '../../dataTypes/atomize';
import ISequence from '../../dataTypes/ISequence';
import sequenceFactory from '../../dataTypes/sequenceFactory';
import DynamicContext from '../../DynamicContext';
import ExecutionParameters from '../../ExecutionParameters';
import Expression from '../../Expression';
import generalCompare from './generalCompare';
import nodeCompare from './nodeCompare';
import valueCompare from './valueCompare';

export class NodeCompare extends Expression {
	private _operator: string;
	private _firstExpression: Expression;
	private _secondExpression: Expression;

	constructor(kind: string, firstExpression: Expression, secondExpression: Expression) {
		super(
			firstExpression.specificity.add(secondExpression.specificity),
			[firstExpression, secondExpression],
			{
				canBeStaticallyEvaluated: false,
			}
		);
		this._firstExpression = firstExpression;
		this._secondExpression = secondExpression;
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

		return firstSequence.switchCases({
			empty: () => {
				return sequenceFactory.empty();
			},
			multiple: () => {
				throw new Error('XPTY0004: Sequences to compare are not singleton');
			},
			singleton: () =>
				secondSequence.switchCases({
					empty: () => {
						return sequenceFactory.empty();
					},
					multiple: () => {
						throw new Error('XPTY0004: Sequences to compare are not singleton');
					},
					singleton: () => {
						const first = firstSequence.first();
						const second = secondSequence.first();
						const compareFunction = nodeCompare(
							this._operator,
							executionParameters.domFacade,
							first.type,
							second.type
						);
						return compareFunction(firstSequence, secondSequence, dynamicContext)
							? sequenceFactory.singletonTrueSequence()
							: sequenceFactory.singletonFalseSequence();
					},
				}),
		});
	}
}

function atomizeSequence(sequence: ISequence, executionParameters: ExecutionParameters): ISequence {
	let currentSequence: ISequence;

	return sequenceFactory.create({
		next: (iterationHint) => {
			while (true) {
				if (!currentSequence) {
					const value = sequence.value.next(iterationHint);
					if (value.done) {
						return DONE_TOKEN;
					}

					currentSequence = atomizeSingleValue(value.value, executionParameters);
				}
				const atomizedValue = currentSequence.value.next(iterationHint);
				if (atomizedValue.done) {
					currentSequence = null;
					continue;
				}

				return atomizedValue;
			}
		},
	});
}

export class ValueCompare extends Expression {
	private _firstExpression: Expression;
	private _operator: string;
	private _secondExpression: Expression;

	constructor(kind: string, firstExpression: Expression, secondExpression: Expression) {
		super(
			firstExpression.specificity.add(secondExpression.specificity),
			[firstExpression, secondExpression],
			{
				canBeStaticallyEvaluated: false,
			}
		);
		this._firstExpression = firstExpression;
		this._secondExpression = secondExpression;
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

		const firstAtomizedSequence = atomizeSequence(firstSequence, executionParameters);
		const secondAtomizedSequence = atomizeSequence(secondSequence, executionParameters);

		return firstAtomizedSequence.switchCases({
			empty: () => sequenceFactory.empty(),
			singleton: () =>
				secondAtomizedSequence.switchCases({
					empty: () => sequenceFactory.empty(),
					singleton: () =>
						firstAtomizedSequence.mapAll(([onlyFirstValue]) =>
							secondAtomizedSequence.mapAll(([onlySecondValue]) => {
								const compareFunction = valueCompare(
									this._operator,
									onlyFirstValue.type,
									onlySecondValue.type
								);

								return compareFunction(
									onlyFirstValue,
									onlySecondValue,
									dynamicContext
								)
									? sequenceFactory.singletonTrueSequence()
									: sequenceFactory.singletonFalseSequence();
							})
						),
					multiple: () => {
						throw new Error('XPTY0004: Sequences to compare are not singleton.');
					},
				}),
			multiple: () => {
				throw new Error('XPTY0004: Sequences to compare are not singleton.');
			},
		});
	}
}

export class GeneralCompare extends Expression {
	private _firstExpression: Expression;
	private _operator: string;
	private _secondExpression: Expression;

	constructor(kind: string, firstExpression: Expression, secondExpression: Expression) {
		super(
			firstExpression.specificity.add(secondExpression.specificity),
			[firstExpression, secondExpression],
			{
				canBeStaticallyEvaluated: false,
			}
		);
		this._firstExpression = firstExpression;
		this._secondExpression = secondExpression;
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

		return firstSequence.switchCases({
			empty: () => {
				return sequenceFactory.singletonFalseSequence();
			},
			default: () =>
				secondSequence.switchCases({
					empty: () => {
						return sequenceFactory.singletonFalseSequence();
					},
					default: () => {
						const firstAtomizedSequence = atomizeSequence(
							firstSequence,
							executionParameters
						);
						const secondAtomizedSequence = atomizeSequence(
							secondSequence,
							executionParameters
						);

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
