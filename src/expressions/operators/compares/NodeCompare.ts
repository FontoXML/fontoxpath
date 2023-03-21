import DomFacade from '../../../domFacade/DomFacade';
import Expression from '../../../expressions/Expression';
import { compareNodePositions } from '../../dataTypes/documentOrderUtils';
import ISequence from '../../dataTypes/ISequence';
import isSubtypeOf from '../../dataTypes/isSubtypeOf';
import sequenceFactory from '../../dataTypes/sequenceFactory';
import { ValueType } from '../../dataTypes/Value';
import DynamicContext from '../../DynamicContext';
import ExecutionParameters from '../../ExecutionParameters';
import arePointersEqual from './arePointersEqual';

/**
 * Takes in the type of two nodes and its context and returns the node comparison function;
 * Using the inferred types we return the function that we can execute.
 *
 * @param operator The operator that has to be carried out.
 * @param domFacade domFacade.
 * @param first to be compared.
 * @param second to be compared.
 * @returns Comparison function
 */
function nodeCompare(
	operator: string,
	domFacade: DomFacade,
	first: ValueType,
	second: ValueType
): (firstSequence: ISequence, secondSequence: ISequence, context: DynamicContext) => boolean {
	// https://www.w3.org/TR/xpath-31/#doc-xpath31-NodeComp

	if (!isSubtypeOf(first, ValueType.NODE) || !isSubtypeOf(second, ValueType.NODE)) {
		throw new Error('XPTY0004: Sequences to compare are not nodes');
	}

	switch (operator) {
		case 'isOp':
			return isOpHandler(first, second);

		case 'nodeBeforeOp':
			if (!domFacade) {
				return undefined;
			}
			return (firstSequenceParam, secondSequenceParam) => {
				return (
					compareNodePositions(
						domFacade,
						firstSequenceParam.first(),
						secondSequenceParam.first()
					) < 0
				);
			};

		case 'nodeAfterOp':
			if (!domFacade) {
				return undefined;
			}
			return (firstSequenceParam, secondSequenceParam) => {
				return (
					compareNodePositions(
						domFacade,
						firstSequenceParam.first(),
						secondSequenceParam.first()
					) > 0
				);
			};

		default:
			throw new Error('Unexpected operator');
	}
}

function isOpHandler(
	first: ValueType,
	second: ValueType
): (
	firstSequence: ISequence,
	secondSequence: ISequence,
	dynamicContext: DynamicContext
) => boolean {
	return first === second &&
		(first === ValueType.ATTRIBUTE ||
			first === ValueType.NODE ||
			first === ValueType.ELEMENT ||
			first === ValueType.DOCUMENTNODE ||
			first === ValueType.TEXT ||
			first === ValueType.PROCESSINGINSTRUCTION ||
			first === ValueType.COMMENT)
		? (
				firstSequenceParam: ISequence,
				secondSequenceParam: ISequence,
				_context: DynamicContext
		  ) => {
				return arePointersEqual(
					firstSequenceParam.first().value,
					secondSequenceParam.first().value
				);
		  }
		: (firstSequenceParam: ISequence, secondSequenceParam: ISequence) => false;
}

export default class NodeCompare extends Expression {
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
