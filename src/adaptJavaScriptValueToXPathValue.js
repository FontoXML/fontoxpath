define([
	'./selectors/dataTypes/Sequence',
	'./selectors/dataTypes/BooleanValue',
	'./selectors/dataTypes/StringValue',
	'./selectors/dataTypes/DecimalValue'
], function (
	Sequence,
	BooleanValue,
	StringValue,
	DecimalValue
) {
	function adaptJavaScriptValueToXPathValue (value) {
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

	return function adaptJavaScriptValueToXPath (value) {
		if (Array.isArray(value)) {
			return new Sequence(value.map(adaptJavaScriptValueToXPathValue));
		}

		return Sequence.singleton(adaptJavaScriptValueToXPathValue(value));
	};
});
