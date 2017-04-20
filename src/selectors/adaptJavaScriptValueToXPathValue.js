import Sequence from './dataTypes/Sequence';
import createAtomicValue from './dataTypes/createAtomicValue';
import NodeValue from './dataTypes/NodeValue';

function adaptItemToXPathValue (value) {
	switch (typeof value) {
		case 'boolean':
			return createAtomicValue(value, 'xs:boolean');
		case 'number':
			return createAtomicValue(value, 'xs:decimal');
		case 'string':
			return createAtomicValue(value, 'xs:string');
		case 'object':
			// Test if it is a node
			if (value && value.nodeType) {
				return NodeValue.createFromNode(value);
			}
	}
	throw new Error('Value ' + value + ' of type ' + typeof value + ' is not adaptable to an XPath value.');
}

function adaptJavaScriptValueToXPathValue (type, value) {
	switch (type) {
		case 'xs:boolean':
			return createAtomicValue(!!value, 'xs:boolean');
		case 'xs:string':
			return createAtomicValue(value + '', 'xs:string');
		case 'xs:double':
		case 'xs:numeric':
			return createAtomicValue(+value, 'xs:double');
		case 'xs:decimal':
			return createAtomicValue(+value, 'xs:decimal');
		case 'xs:integer':
			return createAtomicValue(value | 0, 'xs:integer');
		case 'xs:float':
			return createAtomicValue(+value, 'xs:float');
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
