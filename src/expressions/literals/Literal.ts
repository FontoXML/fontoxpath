import Specificity from '../Specificity';
import Expression, { RESULT_ORDERINGS } from '../Expression';

import SequenceFactory from '../dataTypes/SequenceFactory';

import createAtomicValue from '../dataTypes/createAtomicValue';
import ISequence from '../dataTypes/ISequence';

class Literal extends Expression {
	_type: string;
	_createValueSequence: () => ISequence;

	constructor (jsValue: string, type: string) {
		super(
			new Specificity({}),
			[],
			{
				canBeStaticallyEvaluated: true,
				resultOrder: RESULT_ORDERINGS.SORTED
			});
		this._type = type;

		let value;
		switch (type) {
			case 'xs:integer':
				value = createAtomicValue(parseInt(jsValue, 10), type);
				break;
			case 'xs:string':
				value = createAtomicValue(jsValue + '', type);
				break;
			case 'xs:decimal':
				value = createAtomicValue(parseFloat(jsValue), type);
				break;
			case 'xs:double':
				value = createAtomicValue(parseFloat(jsValue), type);
				break;
			default:
				throw new TypeError('Type ' + type + ' not expected in a literal');
		}

		this._createValueSequence = () => SequenceFactory.singleton(value);
	}

	evaluate (_dynamicContext) {
		return this._createValueSequence();
	}
}

export default Literal;
