import Type from './Type';
import facetsByDataTypeName from '../facets/facetsByDataTypeName';

/**
 * @extends {Type}
 */

class PrimitiveType extends Type {
	/**
	 * @param  {string}                                    name
	 * @param  {Object<string, function(string):boolean>}  restrictions
	 * @param  {!Type}                                     parent
	 * @param  {!function(string):boolean}                 validator
	 */
	constructor (name, restrictions, parent, validator) {
		super(name, restrictions, facetsByDataTypeName[name] || parent && parent._facets);

		this._parent = parent;
		this._validator = validator;
	}

	getWhiteSpace () {
		if (this._restrictions && this._restrictions.whiteSpace) {
			return this._restrictions.whiteSpace;
		}
		return this._parent.getWhiteSpace();
	}

	validatePattern (string) {
		return this._validator ? this._validator(string) : true;
	}

	instanceOfType (name) {
		if (name === this._name || this._memberOfUnions.includes(name)) {
			return true;
		}

		return this._parent ? this._parent.instanceOfType(name) : false;
	}

	getPrimitiveType () {
		return this._name;
	}
}

export default PrimitiveType;
