/**
 * @record
 * @template T
 */
export default class Value {
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
};
