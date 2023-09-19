import ISequence from '../dataTypes/ISequence';
import sequenceFactory from '../dataTypes/sequenceFactory';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Expression from '../Expression';
import PossiblyUpdatingExpression from '../PossiblyUpdatingExpression';
import StaticContext from '../StaticContext';
import { IterationHint } from '../util/iterators';
import { StackTraceEntry } from './StackTraceEntry';

export default class StackTraceGenerator extends PossiblyUpdatingExpression {
	private _comment: string;
	private _innerExpressionType: string;
	private _location: SourceRange;

	constructor(
		location: SourceRange,
		innerExpressionType: string,
		innerExpression: Expression,
		comment: string
	) {
		super(innerExpression.specificity, [innerExpression], {
			canBeStaticallyEvaluated: innerExpression.canBeStaticallyEvaluated,
			peer: innerExpression.peer,
			resultOrder: innerExpression.expectedResultOrder,
			subtree: innerExpression.subtree,
		});

		this._innerExpressionType = innerExpressionType;

		this._location = {
			end: {
				column: location.end.column,
				line: location.end.line,
				offset: location.end.offset,
			},
			start: {
				column: location.start.column,
				line: location.start.line,
				offset: location.start.offset,
			},
		};

		this._comment = comment;
	}

	public performFunctionalEvaluation(
		dynamicContext: DynamicContext,
		_executionParameters: ExecutionParameters,
		[sequenceCallback]: ((dynamicContext: DynamicContext) => ISequence)[]
	): ISequence {
		let innerSequence: ISequence;
		try {
			innerSequence = sequenceCallback(dynamicContext);
		} catch (error) {
			throw new StackTraceEntry(
				this._location,
				this._innerExpressionType,
				this._comment,
				error
			);
		}

		return sequenceFactory.create({
			next: (hint: IterationHint) => {
				try {
					return innerSequence.value.next(hint);
				} catch (error) {
					throw new StackTraceEntry(
						this._location,
						this._innerExpressionType,
						this._comment,
						error
					);
				}
			},
		});
	}

	public performStaticEvaluation(staticContext: StaticContext) {
		try {
			super.performStaticEvaluation(staticContext);
		} catch (error) {
			throw new StackTraceEntry(
				this._location,
				this._innerExpressionType,
				this._comment,
				error
			);
		}
	}

	public getBucket() {
		return this._childExpressions[0].getBucket();
	}
}

export type Location = {
	column: number;
	line: number;
	offset: number;
};

export declare type SourceRange = {
	end: Location;
	start: Location;
	comment?: string;
};
