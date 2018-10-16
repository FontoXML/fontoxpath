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
		this.occurrence;
		/**
		 * @type {boolean}
		 */
		this.isRestArgument;
	}
}
