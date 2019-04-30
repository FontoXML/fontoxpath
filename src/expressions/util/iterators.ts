export class IterationResult<T> {
	public done: boolean;
	public promise: Promise<void> | undefined;
	public ready: boolean;
	public value: T | undefined | null;
	constructor(
		done: boolean,
		value: T | undefined,
		promise: Promise<void> | undefined,
		isReady: boolean
	) {
		this.done = done;
		this.value = value;
		this.promise = promise;
		this.ready = isReady;
	}
}

export enum IterationHint {
	NONE = 0,
	SKIP_DESCENDANTS = 1 << 0
}

export const DONE_TOKEN = new IterationResult(true, undefined, undefined, true);
export const notReady = (promise: Promise<void> | undefined) =>
	new IterationResult(false, undefined, promise, false);
export function ready<T>(value: T) {
	return new IterationResult(false, value, undefined, true);
}

export interface IAsyncIterator<T> {
	next(hint: IterationHint): IterationResult<T>;
}

export interface IAsyncResult<T> {
	promise: Promise<void> | undefined;
	ready: boolean;
	value: T | undefined;
}
