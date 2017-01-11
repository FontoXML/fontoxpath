import Item from '../dataTypes/Item';
import DecimalValue from '../dataTypes/DecimalValue';
import DoubleValue from '../dataTypes/DoubleValue';
import IntegerValue from '../dataTypes/IntegerValue';
import StringValue from '../dataTypes/StringValue';
import Specificity from '../Specificity';
import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';

/**
 * @extends {Selector}
 */
class Literal extends Selector {
	/**
	 * @param  {!(number|string)}  value
	 * @param  {!string}           type
	 */
	constructor (value, type) {
		super(new Specificity({}), Selector.RESULT_ORDERINGS.UNSORTED);
		this._type = type;

		/**
		 * @type {Item}
		 */
		var typedValue;
		switch (type) {
			case 'xs:integer':
				typedValue = new IntegerValue(parseInt(value, 10));
				break;
			case 'xs:string':
				typedValue = new StringValue(value + '');
				break;
			case 'xs:decimal':
				typedValue = new DecimalValue(parseFloat(value));
				break;
			case 'xs:double':
				typedValue = new DoubleValue(parseFloat(value));
				break;
			default:
				throw new TypeError('Type ' + type + ' not expected in a literal');
		}

		this._valueSequence = Sequence.singleton(typedValue);
	}

	equals (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		if (!(otherSelector instanceof Literal)) {
			return false;
		}

		const otherLiteral = /** @type {Literal} */ (otherSelector);

		return this._type === otherLiteral._type &&
			this._valueSequence.value.length === otherLiteral._valueSequence.value.length &&
			this._valueSequence.value.every(function (xPathValue, i) {
				return otherLiteral._valueSequence.value[i].primitiveTypeName === xPathValue.primitiveTypeName &&
					otherLiteral._valueSequence.value[i].value === xPathValue.value;
			});
	}

	evaluate (_dynamicContext) {
		return this._valueSequence;
	}
}

export default Literal;
