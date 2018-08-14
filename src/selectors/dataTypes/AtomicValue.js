import Value from './Value';

/**
 * @record
 * @template T
 * @extends {Value}
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
