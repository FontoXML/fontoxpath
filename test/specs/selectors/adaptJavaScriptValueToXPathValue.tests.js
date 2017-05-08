import adaptJavaScriptValueToXPathValue from 'fontoxpath/selectors/adaptJavaScriptValueToXPathValue';

describe('adaptJavaScriptValueToXPathValue', () => {
	it('turns numbers into integers', () => {
		const xPathSequence = adaptJavaScriptValueToXPathValue(1, 'xs:integer');
		chai.assert(xPathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xPathSequence.first().instanceOfType('xs:integer'), 'is an integer');
		chai.assert.equal(xPathSequence.first().value, 1, 'is 1');
	});

	it('does not support unknown types', () => {
		chai.assert.throws(() => adaptJavaScriptValueToXPathValue(1, 'fonto:theBestType'), ' is not expected to be returned from custom function');
	});

	it('turns numbers into doubles', () => {
		const xPathSequence = adaptJavaScriptValueToXPathValue(1.0, 'xs:double');
		chai.assert(xPathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xPathSequence.first().instanceOfType('xs:double'), 'is a double');
		chai.assert.equal(xPathSequence.first().value, 1.0, 'is 1.0');
	});

	it('turns nodes into nodes', () => {
		const xPathSequence = adaptJavaScriptValueToXPathValue(window.document);
		chai.assert(xPathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xPathSequence.first().instanceOfType('node()'), 'is a node');
	});

	it('turns numbers into decimals', () => {
		const xPathSequence = adaptJavaScriptValueToXPathValue(1.0, 'xs:decimal');
		chai.assert(xPathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xPathSequence.first().instanceOfType('xs:decimal'), 'is a decimal');
		chai.assert.equal(xPathSequence.first().value, 1.0, 'is 1.0');
	});

	it('turns numbers into floats', () => {
		const xPathSequence = adaptJavaScriptValueToXPathValue(1.0, 'xs:float');
		chai.assert(xPathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xPathSequence.first().instanceOfType('xs:float'), 'is a float');
		chai.assert.equal(xPathSequence.first().value, 1.0, 'is 1.0');
	});

	it('cannot convert nodes', function () {
		chai.assert.throws(() => adaptJavaScriptValueToXPathValue(window.document.documentElement, 'node()'), 'XPath custom functions should not return a node, use traversals instead.');
	});

	it('turns booleans into booleans', () => {
		const xPathSequence = adaptJavaScriptValueToXPathValue(false, 'xs:boolean');
		chai.assert(xPathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xPathSequence.first().instanceOfType('xs:boolean'), 'is a boolean');
		chai.assert.equal(xPathSequence.first().value, false, 'is false');
	});

	it('turns strings into xs:string?', () => {
		const xPathSequence = adaptJavaScriptValueToXPathValue('a', 'xs:string?');
		chai.assert(xPathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xPathSequence.first().instanceOfType('xs:string'), 'is a string');
		chai.assert.equal(xPathSequence.first().value, 'a', 'is the same string');
	});

	it('turns strings into xs:string+', () => {
		const xPathSequence = adaptJavaScriptValueToXPathValue(['a', 'b', 'c'], 'xs:string+');
		chai.assert.equal(xPathSequence.getLength(), 3, 'is a sequence with length 3');
		const values = xPathSequence.getAllValues();
		chai.assert(xPathSequence.first().instanceOfType('xs:string'), 'first is a string');
		chai.assert(values[1].instanceOfType('xs:string'), 'second is a string');
		chai.assert(values[2].instanceOfType('xs:string'), 'third is a string');
		chai.assert.equal(xPathSequence.first().value, 'a', 'is a');
		chai.assert.equal(values[1].value, 'b', 'is b');
		chai.assert.equal(values[2].value, 'c', 'is c');
	});

	it('turns strings into xs:string*', () => {
		const xPathSequence = adaptJavaScriptValueToXPathValue(['a', 'b', 'c'], 'xs:string*');
		chai.assert.equal(xPathSequence.getLength(), 3, 'is a sequence with length 3');
		const values = xPathSequence.getAllValues();
		chai.assert(xPathSequence.first().instanceOfType('xs:string'), 'first is a string');
		chai.assert(values[1].instanceOfType('xs:string'), 'second is a string');
		chai.assert(values[2].instanceOfType('xs:string'), 'third is a string');
		chai.assert.equal(xPathSequence.first().value, 'a', 'is a');
		chai.assert.equal(values[1].value, 'b', 'is b');
		chai.assert.equal(values[2].value, 'c', 'is c');
	});

	it('turns null into string? (empty sequence)', () => {
		const xPathSequence = adaptJavaScriptValueToXPathValue(null, 'xs:string?');
		chai.assert(xPathSequence.isEmpty(), 'is a singleton sequence');
	});

	describe('converting to item()', () => {
		it('can automatically convert numbers', () => {
			const xPathSequence = adaptJavaScriptValueToXPathValue(1.0, 'item()');
			chai.assert(xPathSequence.isSingleton(), 'is a singleton sequence');
			chai.assert(xPathSequence.first().instanceOfType('xs:decimal'), 'is a decimal');
			chai.assert.equal(xPathSequence.first().value, 1.0, 'is 1.0');
		});

		it('can automatically convert strings', () => {
			const xPathSequence = adaptJavaScriptValueToXPathValue('a', 'item()');
			chai.assert(xPathSequence.isSingleton(), 'is a singleton sequence');
			chai.assert(xPathSequence.first().instanceOfType('xs:string'), 'is a string');
			chai.assert.equal(xPathSequence.first().value, 'a', 'is "a"');
		});

		it('can automatically convert booleans', () => {
			const xPathSequence = adaptJavaScriptValueToXPathValue(true, 'item()');
			chai.assert(xPathSequence.isSingleton(), 'is a singleton sequence');
			chai.assert(xPathSequence.first().instanceOfType('xs:boolean'), 'is a boolean');
			chai.assert.equal(xPathSequence.first().value, true, 'is true');
		});

		it('can not automatically convert objects', () => {
			chai.assert.throws(() => adaptJavaScriptValueToXPathValue({}, 'item()'), 'not adaptable to an XPath value');
		});
	});
});
