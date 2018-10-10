/**
 * @record
 */
export default class TypeDeclaration {
	constructor () {
		/**
		 * @type {string}
		 */
		this.type;
		/**
		 * @type {string}
		 */
		this.occurence;
		/**
		 * @type {boolean}
		 */
		this.isRestArgument;
	}
}
