import Type from './Type';

/**
 * @extends {Type}
 */
class DerivedType extends Type {
	/**
	 * @param  {string}                                    name
	 * @param  {!Object<string,function(string):boolean>}  restrictions
	 * @param  {!Type}                                     base
	 * @param  {?function(string):boolean}                 validator

	 */
	constructor (name, restrictions, base, validator) {
		super(name, restrictions, base._facets);

		this._base = base;
		this._validator = validator;
	}

	validatePattern (string) {
		if (this._validator) {
			return this._validator(string);
		}

		return this._base.validatePattern(string);
	}

	getWhiteSpace () {
		if (this._restrictions && this._restrictions.whiteSpace) {
			return this._restrictions.whiteSpace;
		}
		return this._base.getWhiteSpace();
	}

	/**
	 * @override
	 */
	getValidatorForRestriction (restrictionName) {
		return this._base.getValidatorForRestriction(restrictionName);
	}

	instanceOfType (name) {
		if (this._name === name || this._memberOfUnions.includes(name)) {
			return true;
		}

		return this._base.instanceOfType(name);
	}

	getPrimitiveType () {
		return this._base.getPrimitiveType();
	}

}
export default DerivedType;
