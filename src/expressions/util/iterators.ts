export class IterationResult<T> {
	public done: boolean;
	public promise: Promise<void> | undefined;
	public value: T | undefined | null;
	constructor(done: boolean, value: T | undefined, promise: Promise<void> | undefined) {
		this.done = done;
		this.value = value;
		this.promise = promise;
	}
}

export enum IterationHint {
	NONE = 0,
	SKIP_DESCENDANTS = 1 << 0,
}

export const DONE_TOKEN = new IterationResult(true, undefined, undefined);
export function ready<T>(value: T) {
	return new IterationResult(false, value, undefined);
}

export interface IAsyncIterator<T> {
	next(hint: IterationHint): IterationResult<T>;
}

export interface IAsyncResult<T> {
	promise: Promise<void> | undefined;
	value: T | undefined;
}
