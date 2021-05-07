import isSubtypeOf from '../dataTypes/isSubtypeOf';
import Value, { stringToSequenceType } from '../dataTypes/Value';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Specificity from '../Specificity';
import TestAbstractExpression from './TestAbstractExpression';

class TypeTest extends TestAbstractExpression {
	public _type: { localName: string; namespaceURI: string; prefix: string };

	constructor(type: { localName: string; namespaceURI: string | null; prefix: string }) {
		super(new Specificity({}));
		this._type = type;
	}

	public evaluateToBoolean(
		_dynamicContext: DynamicContext,
		item: Value,
		_executionParameters: ExecutionParameters
	) {
		return isSubtypeOf(
			item.type.kind,
			stringToSequenceType(
				this._type.prefix
					? this._type.prefix + ':' + this._type.localName
					: this._type.localName
			).kind
		);
	}
}
export default TypeTest;
