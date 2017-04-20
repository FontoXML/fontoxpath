/**
 * @record
 * @template T
 */
export default class AtomicValue {
	constructor () {
		/**
		 * @type {string}
		 */
		this.type;
		/**
		 * @type {T}
		 */
		this.value;
	}
}
