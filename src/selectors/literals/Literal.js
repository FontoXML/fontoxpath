import DecimalValue from '../dataTypes/DecimalValue';
import DoubleValue from '../dataTypes/DoubleValue';
import IntegerValue from '../dataTypes/IntegerValue';
import StringValue from '../dataTypes/StringValue';
import Specificity from '../Specificity';
import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';

/**
 * @constructor
 * @extends {Selector}
 *
 * @param  {!(number|string)}  value
 * @param  {!string}           type
 */
function Literal (value, type) {
    Selector.call(this, new Specificity({}), Selector.RESULT_ORDER_UNSORTED);
    this._type = type;

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

Literal.prototype = Object.create(Selector.prototype);
Literal.prototype.constructor = Literal;

Literal.prototype.equals = function (otherSelector) {
    if (this === otherSelector) {
        return true;
    }

    return otherSelector instanceof Literal &&
        this._type === otherSelector._type &&
        this._valueSequence.length === otherSelector._valueSequence.length &&
        this._valueSequence.value.every(function (xPathValue, i) {
            return otherSelector._valueSequence.value[i].primitiveTypeName === xPathValue.primitiveTypeName &&
                otherSelector._valueSequence.value[i].value === xPathValue.value;
        });
};

Literal.prototype.evaluate = function (_dynamicContext) {
    return this._valueSequence;
};

export default Literal;
