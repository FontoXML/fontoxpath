import Sequence from './dataTypes/Sequence';
import BooleanValue from './dataTypes/BooleanValue';
import DecimalValue from './dataTypes/DecimalValue';
import DoubleValue from './dataTypes/DoubleValue';
import FloatValue from './dataTypes/FloatValue';
import IntegerValue from './dataTypes/IntegerValue';
import StringValue from './dataTypes/StringValue';

function adaptItemToXPathValue (value) {
    switch (typeof value) {
        case 'boolean':
            return value ? BooleanValue.TRUE : BooleanValue.FALSE;
        case 'number':
            return new DecimalValue(value);
        case 'string':
            return new StringValue(value);
        default:
            throw new Error('Value ' + value + ' of type ' + typeof value + ' is not adaptable to an XPath value.');
    }
}

function adaptJavaScriptValueToXPathValue (type, value) {
    switch (type) {
        case 'xs:boolean':
            return value ? BooleanValue.TRUE : BooleanValue.FALSE;
        case 'xs:string':
            return new StringValue(value + '');
        case 'xs:double':
        case 'xs:numeric':
            return new DoubleValue(+value);
        case 'xs:decimal':
            return new DecimalValue(+value);
        case 'xs:integer':
            return new IntegerValue(value | 0);
        case 'xs:float':
            return new FloatValue(+value);
        case 'node()':
            throw new Error('XPath custom functions should not return a node, use traversals instead.');
        case 'item()':
            return adaptItemToXPathValue(value);
        default:
            throw new Error('Values of the type ' + type + ' is not expected to be returned from custom function.');
    }
}

/**
 * @param  {?}        value
 * @param  {string=}  expectedType
 */
export default function adaptJavaScriptValueToXPath (value, expectedType) {
    expectedType = expectedType || 'item()';

    var parts = expectedType.match(/^([^+?*]*)([\+\*\?])?$/),
        type = parts[1],
        multiplicity = parts[2];

    switch (multiplicity) {
        case '?':
            if (value === null) {
                return Sequence.empty();
            }
            return Sequence.singleton(adaptJavaScriptValueToXPathValue(type, value));

        case '+':
        case '*':
            return new Sequence(value.map(adaptJavaScriptValueToXPathValue.bind(null, type)));

        default:
            return Sequence.singleton(adaptJavaScriptValueToXPathValue(type, value));
    }
}
