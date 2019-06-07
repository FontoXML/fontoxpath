import { SourceRange } from './StackTraceGenerator';
export class StackTraceEntry {
	public innerExpressionType: string;
	public innerTrace: Error | StackTraceEntry;
	public location: SourceRange;

	constructor(
		location: SourceRange,
		innerExpressionType: string,
		innerTrace: Error | StackTraceEntry
	) {
		this.location = location;
		this.innerExpressionType = innerExpressionType;
		this.innerTrace = innerTrace;
	}

	public getErrorLocation(): SourceRange {
		return this.innerTrace instanceof Error
			? this.location
			: this.innerTrace.getErrorLocation();
	}

	public makeStackTrace(): string[] {
		const innerStackTrace =
			this.innerTrace instanceof Error
				? [this.innerTrace.toString()]
				: this.innerTrace.makeStackTrace();
		innerStackTrace.push(
			`  at <${this.innerExpressionType}>:${this.location.start.line}:${this.location.start.column} - ${this.location.end.line}:${this.location.end.column}`
		);
		return innerStackTrace;
	}
}
