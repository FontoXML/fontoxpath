import AtomicValue from '../dataTypes/AtomicValue';
import createAtomicValue from '../dataTypes/createAtomicValue';
import ISequence from '../dataTypes/ISequence';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { ValueType } from '../dataTypes/Value';
import Expression, { RESULT_ORDERINGS } from '../Expression';
import Specificity from '../Specificity';

class Literal extends Expression {
	private _createValueSequence: () => ISequence;
	private _type: ValueType;

	constructor(jsValue: string, type: ValueType) {
		super(new Specificity({}), [], {
			canBeStaticallyEvaluated: true,
			resultOrder: RESULT_ORDERINGS.SORTED,
		});
		this._type = type;

		let value: AtomicValue;
		switch (type) {
			case ValueType.XSINTEGER:
				value = createAtomicValue(parseInt(jsValue, 10), type);
				break;
			case ValueType.XSSTRING:
				value = createAtomicValue(jsValue + '', type);
				break;
			case ValueType.XSDECIMAL:
			case ValueType.XSDOUBLE:
				value = createAtomicValue(parseFloat(jsValue), type);
				break;
			default:
				throw new TypeError('Type ' + type + ' not expected in a literal');
		}

		this._createValueSequence = () => sequenceFactory.singleton(value);
	}

	public evaluate(_dynamicContext) {
		return this._createValueSequence();
	}
}

export default Literal;
