import AtomicValue from '../dataTypes/AtomicValue';
import createAtomicValue from '../dataTypes/createAtomicValue';
import ISequence from '../dataTypes/ISequence';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { SequenceType, ValueType } from '../dataTypes/Value';
import Expression, { RESULT_ORDERINGS } from '../Expression';
import Specificity from '../Specificity';

class Literal extends Expression {
	private _createValueSequence: () => ISequence;

	constructor(jsValue: string, type: SequenceType) {
		super(
			new Specificity({}),
			[],
			{
				canBeStaticallyEvaluated: true,
				resultOrder: RESULT_ORDERINGS.SORTED,
			},
			false,
			type,
		);

		let value: AtomicValue;
		switch (type.type) {
			case ValueType.XSINTEGER:
				value = createAtomicValue(parseInt(jsValue, 10), type.type);
				break;
			case ValueType.XSSTRING:
				value = createAtomicValue(jsValue + '', type.type);
				break;
			case ValueType.XSDECIMAL:
			case ValueType.XSDOUBLE:
				value = createAtomicValue(parseFloat(jsValue), type.type);
				break;
			default:
				throw new TypeError('Type ' + type + ' not expected in a literal');
		}

		this._createValueSequence = () => sequenceFactory.singleton(value);
	}

	public evaluate() {
		return this._createValueSequence();
	}
}

export default Literal;
