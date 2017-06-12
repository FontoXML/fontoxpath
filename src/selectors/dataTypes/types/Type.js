/**
 * @enum {string}
 */
const EWhitespaceTypes = {
	PRESERVE: 'preserve',
	REPLACE: 'replace',
	COLLAPSE: 'collapse'
};

/**
 * @abstract
 */
class Type {
	/**
	 * @param  {string}                                      varietyName
	 * @param  {../ETypeNames}                               name
	 * @param  {Object<string, function (string): boolean>}  restrictions
	 * @param  {Object<string, function (string): *>}        facets
	 */
	constructor (varietyName, name, restrictions, facets) {
		this._name = name + '';
		this._restrictions = restrictions;
		this._facets = facets;

		this.WHITESPACETYPES = EWhitespaceTypes;
	}

	getValidatorForRestriction (restrictionName) {
		// The XSD 1.1 spec defines a few types we don't support yet, and allows implementations to define additional
		// primitive datatypes and facets. Warn about and then ignore such cases.
		if (!this._facets[restrictionName]) {
			return () => true;
		}

		return this._facets[restrictionName];
	}

	/**
	 * @protected
	 */
	validateRestrictions (value) {
		if (!this._restrictions) {
			return true;
		}

		return Object.keys(this._restrictions).every((restrictionName) => {
			if (restrictionName === 'whiteSpace') {
				// whiteSpace will be handled separately
				return true;
			}

			var validationFunction = this.getValidatorForRestriction(restrictionName);
			return validationFunction(value, this._restrictions[restrictionName]);
		});
	}

	/**
	 * @abstract
	 */
	getWhiteSpace () {
	}


	/**
	 * @abstract
	 * @param  {string}  _string
	 */
	validatePattern (_string) {
	}

	/**
	 * @abstract
	 * @param  {string}  _name
	 */
	instanceOfType (_name) {
	}

	/**
	 * @abstract
	 */
	getPrimitiveType () {
	}

}
export default Type;
