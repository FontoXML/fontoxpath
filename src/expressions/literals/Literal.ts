import Expression, { RESULT_ORDERINGS } from '../Expression';
import Specificity from '../Specificity';

import sequenceFactory from '../dataTypes/sequenceFactory';

import createAtomicValue from '../dataTypes/createAtomicValue';
import ISequence from '../dataTypes/ISequence';
import { BaseType, ValueType, SequenceType } from '../dataTypes/Value';

class Literal extends Expression {
	private _createValueSequence: () => ISequence;
	private _type: ValueType;

	constructor(jsValue: string, type: ValueType) {
		super(new Specificity({}), [], {
			canBeStaticallyEvaluated: true,
			resultOrder: RESULT_ORDERINGS.SORTED,
		});
		this._type = type;

		let value;
		switch (type.kind) {
			case BaseType.XSINTEGER:
				value = createAtomicValue(parseInt(jsValue, 10), type);
				break;
			case BaseType.XSSTRING:
				value = createAtomicValue(jsValue + '', type);
				break;
			case BaseType.XSDECIMAL:
			case BaseType.XSDOUBLE:
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
