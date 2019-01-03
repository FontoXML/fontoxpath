export class IterationResult<T> {
	done: boolean;
	value: T|undefined;
	promise: Promise<void>|undefined;
	ready: boolean;
	constructor (done: boolean, value: T|undefined, promise: Promise<void>|undefined, ready: boolean) {
		this.done = done;
		this.value = value;
		this.promise = promise;
		this.ready = ready;
	}
}

export const DONE_TOKEN = new IterationResult(true, undefined, undefined, true);
export const notReady = promise => new IterationResult(false, undefined, promise, false);
export const ready = value => new IterationResult(false, value, undefined, true);

export interface AsyncIterator<T> {
	next (): IterationResult<T>;
}

export interface AsyncResult<T> {
	value: (T|undefined);
	promise: (Promise<void>|undefined);
	ready: boolean;
}
