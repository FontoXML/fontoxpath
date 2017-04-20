import Type from './Type';
import facetsByDataTypeName from '../facets/facetsByDataTypeName';

/**
 * @extends {Type}
 */
class ListType extends Type {
	constructor (name, restrictions, type) {
		super(name, restrictions, facetsByDataTypeName.list);

		this._type = type;
	}

	validatePattern (_string) {
		return true;
	}

	// A list will always have whiteSpace = collapse
	getWhiteSpace () {
		return this.WHITESPACETYPES.COLLAPSE;
	}

	instanceOfType (name) {
		return name === this._name;
	}

	getPrimitiveType () {
		return 'list';
	}

}
export default ListType;
