import { SourceRange } from '../expressions/debug/StackTraceGenerator';

export class PositionedError extends Error {
	public readonly position: SourceRange;

	constructor(message: string, position: SourceRange) {
		super(message);
		this['position'] = {
			['end']: {
				['column']: position.end.column,
				['line']: position.end.line,
				['offset']: position.end.offset,
			},
			['start']: {
				['column']: position.start.column,
				['line']: position.start.line,
				['offset']: position.start.offset,
			},
		};
	}
}
