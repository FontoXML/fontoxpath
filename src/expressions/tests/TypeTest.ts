import TestAbstractExpression from './TestAbstractExpression';
import Specificity from '../Specificity';
import isSubtypeOf from '../dataTypes/isSubtypeOf';

class TypeTest extends TestAbstractExpression {
	_type: { prefix: string; namespaceURI: string; localName: string };

	constructor(type: { prefix: string; namespaceURI: string | null; localName: string }) {
		super(new Specificity({}));
		this._type = type;
	}

	evaluateToBoolean(_dynamicContext, item) {
		return isSubtypeOf(
			item.type,
			this._type.prefix
				? this._type.prefix + ':' + this._type.localName
				: this._type.localName
		);
	}
}
export default TypeTest;
