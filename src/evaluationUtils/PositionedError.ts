import { SourceRange } from '../expressions/debug/StackTraceGenerator';
export class PositionedError extends Error {
	public readonly position: SourceRange;
	constructor(message: string, position: SourceRange) {
		super(message);
		this.position = position;
	}
}
