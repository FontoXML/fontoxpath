export class IterationResult<T> {
	public done: boolean;
	public value: T | undefined | null;
	constructor(done: boolean, value: T | undefined) {
		this.done = done;
		this.value = value;
	}
}

export enum IterationHint {
	NONE = 0,
	SKIP_DESCENDANTS = 1 << 0,
}

export const DONE_TOKEN = new IterationResult(true, undefined);
export function ready<T>(value: T) {
	return new IterationResult(false, value);
}

export interface IIterator<T> {
	next(hint: IterationHint): IterationResult<T>;
}
