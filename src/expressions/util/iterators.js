/**
 * @template T
 */
export class IterationResult {
	constructor (done, value, promise, ready) {
		/**
		 * @type {boolean}
		 */
		this.done = done;
		/**
		 * @type {T|undefined}
		 */
		this.value = value;
		/**
		 * @type {Promise|undefined}
		 */
		this.promise = promise;
		/**
		 * @type {boolean}
		 */
		this.ready = ready;
	}
}

export const DONE_TOKEN = new IterationResult(true, undefined, undefined, true);
export const notReady = promise => new IterationResult(false, undefined, promise, false);
export const ready = value => new IterationResult(false, value, undefined, true);

/**
 * @record
 * @template T
 */
export class AsyncIterator {
	/**
	 * @return {!IterationResult<T>}
	 */
	next () {}
}

/**
 * @record
 * @template T
 */
export class AsyncResult {
	constructor () {
		/**
		 * @type {T|undefined}
		 */
		this.value;
		/**
		 * @type {Promise|undefined}
		 */
		this.promise;
		/**
		 * @type {boolean}
		 */
		this.ready;
	}
}
