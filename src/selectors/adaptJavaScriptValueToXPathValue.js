define([
	'./dataTypes/Sequence',
	'./dataTypes/BooleanValue',
	'./dataTypes/StringValue',
	'./dataTypes/DecimalValue'
], function (
	Sequence,
	BooleanValue,
	StringValue,
	DecimalValue
) {
	function adaptItemToXPathValue (value) {
		switch(typeof value) {
			case 'boolean':
				return new BooleanValue(value);
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
				return new BooleanValue(!!value);
			case 'xs:string':
				return new StringValue(value + '');
			case 'xs:double':
			case 'xs:numeric':
				return new DoubleValue(+value);
			case 'xs:decimal':
				return new DecimalValue(+value);
			case 'xs:interger':
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

	return function adaptJavaScriptValueToXPath (value, expectedType) {
		expectedType = expectedType || 'item()';

		var parts = expectedType.match(/^([^+?*]*)([\+\*\?])?$/),
			type = parts[1],
			multiplicity = parts[2];

		switch (multiplicity) {
			case '?':
				return Sequence.singleton(adaptJavaScriptValueToXPathValue(type, value));

			case '+':
			case '*':
				return new Sequence(value.map(adaptJavaScriptValueToXPathValue.bind(undefined, type)));

			default:
				return Sequence.singleton(adaptJavaScriptValueToXPathValue(type, value));
		}
	};
});
