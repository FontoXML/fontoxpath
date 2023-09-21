import { PositionedError } from '../../evaluationUtils/PositionedError';
import { SourceRange } from './StackTraceGenerator';
export class StackTraceEntry {
	public comment: string;
	public innerExpressionType: string;
	public innerTrace: Error | PositionedError | StackTraceEntry;
	public location: SourceRange;

	constructor(
		location: SourceRange,
		innerExpressionType: string,
		comment: string,
		innerTrace: Error | StackTraceEntry,
	) {
		this.location = location;
		this.innerExpressionType = innerExpressionType;
		this.comment = comment;
		this.innerTrace = innerTrace;
	}

	public getErrorLocation(): SourceRange {
		return this.innerTrace instanceof Error
			? this.location
			: this.innerTrace.getErrorLocation();
	}

	public makeStackTrace(): string[] {
		let innerStackTrace: string[];
		if (this.innerTrace instanceof PositionedError) {
			// We are dealing with a nested positioned error
			innerStackTrace = ['Inner error:', this.innerTrace.message];
		} else if (this.innerTrace instanceof Error) {
			innerStackTrace = [this.innerTrace.toString()];
		} else {
			innerStackTrace = this.innerTrace.makeStackTrace();
		}
		innerStackTrace.push(
			`  at <${this.innerExpressionType}${this.comment ? ` (${this.comment})` : ''}>:${
				this.location.start.line
			}:${this.location.start.column} - ${this.location.end.line}:${
				this.location.end.column
			}`,
		);
		return innerStackTrace;
	}
}
