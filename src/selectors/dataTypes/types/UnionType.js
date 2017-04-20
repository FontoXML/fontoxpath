import Type from './Type';
import facetsByDataTypeName from '../facets/facetsByDataTypeName';

/**
 * @extends {Type}
 */
class UnionType extends Type {
	constructor (name, restrictions, memberTypes) {
		super(name, restrictions, facetsByDataTypeName.union);

		this._memberTypes = memberTypes;

		this._memberTypes.forEach((memberType) => {
			memberType.addAsMemberOfUnion(name);
		});
	}

	validatePattern (_string) {
		return true;
	}

	getWhiteSpace () {
		throw new Error('A union of types has no whitespace facet.');
	}

	instanceOfType (name) {
		if (name === this._name) {
			return true;
		}

		return this._memberTypes.some((memberType) => memberType.instanceOfType(name));
	}

	getPrimitiveType () {
		return 'union';
	}
}

export default UnionType;
