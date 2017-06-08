import Specificity from '../Specificity';
import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';

import createAtomicValue from '../dataTypes/createAtomicValue';

/**
 * @extends {Selector}
 */
class Literal extends Selector {
	/**
	 * @param  {!(number|string)}  jsValue
	 * @param  {!string}           type
	 */
	constructor (jsValue, type) {
		super(new Specificity({}), {
			canBeStaticallyEvaluated: true,
			resultOrder: Selector.RESULT_ORDERINGS.SORTED
		});
		this._type = type;

		/**
		 * @type {../dataTypes/Value}
		 */
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

		this._valueSequence = Sequence.singleton(value);
	}

	evaluate (_dynamicContext) {
		return this._valueSequence;
	}
}

export default Literal;
