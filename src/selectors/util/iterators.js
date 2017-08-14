/**
 * @record
 * @template T
 */
export class IterationResult {
	constructor () {
		/**
		 * @type {boolean}
		 */
		this.done;
		/**
		 * @type {T}
		 */
		this.value;
		/**
		 * @type Promise|undefined
		 */
		this.promise;
		/**
		 * @type boolean
		 */
		this.ready;
	}
};

export const DONE_TOKEN = { done: true, value: undefined, ready: true, promise: undefined };
export const notReady = promise => ({ done: false, value: undefined, ready: false, promise: promise });
export const ready = value => ({ done: false, value: value, ready: true, promise: undefined });

/**
 * @record
 * @template T
 */
export class AsyncIterator {
	/**
	 * @return {!IterationResult<T>}
	 */
	next () {}
};

/**
 * @record
 * @template T
 */
export class AsyncResult {
	constructor () {
		/**
		 * @type {T}
		 */
		this.value;
		/**
		 * @type Promise|undefined
		 */
		this.promise;
	}
};
