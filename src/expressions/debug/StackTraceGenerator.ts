import ISequence from '../dataTypes/ISequence';
import sequenceFactory from '../dataTypes/sequenceFactory';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Expression from '../Expression';
import PossiblyUpdatingExpression from '../PossiblyUpdatingExpression';

export class StackTraceEntry {
	public innerExpressionType: string;
	public innerTrace: Error | StackTraceEntry;
	public location: SourceRange;

	constructor(location, innerExpressionType: string, innerTrace: Error | StackTraceEntry) {
		this.location = location;
		this.innerExpressionType = innerExpressionType;
		this.innerTrace = innerTrace;
	}

	public makeStackTrace(): string[] {
		const innerStackTrace =
			this.innerTrace instanceof Error
				? [this.innerTrace.toString()]
				: this.innerTrace.makeStackTrace();

		innerStackTrace.push(
			`  at <${this.innerExpressionType}>:${this.location.start.line}:${
				this.location.start.column
			} - ${this.location.end.line}:${this.location.end.column}`
		);

		return innerStackTrace;
	}
}

type Location = {
	column: number;
	line: number;
	offset: number;
};

type SourceRange = {
	end: Location;
	start: Location;
};

class StackTraceGenerator extends PossiblyUpdatingExpression {
	private _innerExpressionType: string;
	private _location: SourceRange;

	constructor(location: SourceRange, innerExpressionType: string, innerExpression: Expression) {
		super(innerExpression.specificity, [innerExpression], {});

		this._innerExpressionType = innerExpressionType;

		this._location = {
			end: {
				column: location['end']['column'],
				line: location['end']['line'],
				offset: location['end']['offset']
			},
			start: {
				column: location['start']['column'],
				line: location['start']['line'],
				offset: location['start']['offset']
			}
		};
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
			throw new StackTraceEntry(this._location, this._innerExpressionType, error);
		}

		return sequenceFactory.create({
			next: () => {
				try {
					return innerSequence.value.next();
				} catch (error) {
					throw new StackTraceEntry(this._location, this._innerExpressionType, error);
				}
			}
		});
	}

	public performStaticEvaluation(staticContext) {
		super.performStaticEvaluation(staticContext);
	}
}

export default StackTraceGenerator;
