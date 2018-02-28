import adaptJavaScriptValueToXPathValue from 'fontoxpath/selectors/adaptJavaScriptValueToXPathValue';

describe('adaptJavaScriptValueToXPathValue', () => {
	it('turns numbers into integers', () => {
		const xpathSequence = adaptJavaScriptValueToXPathValue(1, 'xs:integer');
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type === ('xs:integer'), 'is an integer');
		chai.assert.equal(xpathSequence.first().value, 1, 'is 1');
	});

	it('does not support unknown types', () => {
		chai.assert.throws(() => adaptJavaScriptValueToXPathValue(1, 'fonto:theBestType'), ' can not be adapted to equivalent XPath values');
	});

	it('turns numbers into doubles', () => {
		const xpathSequence = adaptJavaScriptValueToXPathValue(1.0, 'xs:double');
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type === ('xs:double'), 'is a double');
		chai.assert.equal(xpathSequence.first().value, 1.0, 'is 1.0');
	});

	it('turns nodes into nodes', () => {
		const xpathSequence = adaptJavaScriptValueToXPathValue(window.document);
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type === 'document()', 'is a document');
	});

	it('turns numbers into decimals', () => {
		const xpathSequence = adaptJavaScriptValueToXPathValue(1.0, 'xs:decimal');
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type === ('xs:decimal'), 'is a decimal');
		chai.assert.equal(xpathSequence.first().value, 1.0, 'is 1.0');
	});

	it('turns numbers into floats', () => {
		const xpathSequence = adaptJavaScriptValueToXPathValue(1.0, 'xs:float');
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type === ('xs:float'), 'is a float');
		chai.assert.equal(xpathSequence.first().value, 1.0, 'is 1.0');
	});

	it('cannot convert nodes', function () {
		chai.assert.throws(() => adaptJavaScriptValueToXPathValue(window.document.documentElement, 'node()'), 'XPath custom functions should not return a node, use traversals instead.');
	});

	it('turns booleans into booleans', () => {
		const xpathSequence = adaptJavaScriptValueToXPathValue(false, 'xs:boolean');
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type === ('xs:boolean'), 'is a boolean');
		chai.assert.equal(xpathSequence.first().value, false, 'is false');
	});

	it('turns strings into xs:string?', () => {
		const xpathSequence = adaptJavaScriptValueToXPathValue('a', 'xs:string?');
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type === ('xs:string'), 'is a string');
		chai.assert.equal(xpathSequence.first().value, 'a', 'is the same string');
	});

	it('turns strings into xs:string+', () => {
		const xpathSequence = adaptJavaScriptValueToXPathValue(['a', 'b', 'c'], 'xs:string+');
		chai.assert.equal(xpathSequence.getLength(), 3, 'is a sequence with length 3');
		const values = xpathSequence.getAllValues();
		chai.assert(xpathSequence.first().type === ('xs:string'), 'first is a string');
		chai.assert(values[1].type === ('xs:string'), 'second is a string');
		chai.assert(values[2].type === ('xs:string'), 'third is a string');
		chai.assert.equal(xpathSequence.first().value, 'a', 'is a');
		chai.assert.equal(values[1].value, 'b', 'is b');
		chai.assert.equal(values[2].value, 'c', 'is c');
	});

	it('turns strings into xs:string*', () => {
		const xpathSequence = adaptJavaScriptValueToXPathValue(['a', 'b', 'c'], 'xs:string*');
		chai.assert.equal(xpathSequence.getLength(), 3, 'is a sequence with length 3');
		const values = xpathSequence.getAllValues();
		chai.assert(xpathSequence.first().type === ('xs:string'), 'first is a string');
		chai.assert(values[1].type === ('xs:string'), 'second is a string');
		chai.assert(values[2].type === ('xs:string'), 'third is a string');
		chai.assert.equal(xpathSequence.first().value, 'a', 'is a');
		chai.assert.equal(values[1].value, 'b', 'is b');
		chai.assert.equal(values[2].value, 'c', 'is c');
	});

	it('turns null into string? (empty sequence)', () => {
		const xpathSequence = adaptJavaScriptValueToXPathValue(null, 'xs:string?');
		chai.assert(xpathSequence.isEmpty(), 'is a singleton sequence');
	});

	describe('converting to item()', () => {
		it('can automatically convert numbers', () => {
			const xpathSequence = adaptJavaScriptValueToXPathValue(1.0, 'item()');
			chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
			chai.assert(xpathSequence.first().type === ('xs:decimal'), 'is a decimal');
			chai.assert.equal(xpathSequence.first().value, 1.0, 'is 1.0');
		});

		it('can automatically convert strings', () => {
			const xpathSequence = adaptJavaScriptValueToXPathValue('a', 'item()');
			chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
			chai.assert(xpathSequence.first().type === ('xs:string'), 'is a string');
			chai.assert.equal(xpathSequence.first().value, 'a', 'is "a"');
		});

		it('can automatically convert booleans', () => {
			const xpathSequence = adaptJavaScriptValueToXPathValue(true, 'item()');
			chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
			chai.assert(xpathSequence.first().type === ('xs:boolean'), 'is a boolean');
			chai.assert.equal(xpathSequence.first().value, true, 'is true');
		});

		it('can automatically convert objects', () => {
			const xpathSequence = adaptJavaScriptValueToXPathValue({}, 'item()');
			chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
			chai.assert(xpathSequence.first().type === ('map(*)'), 'is a map');
		});

		it('can automatically convert null to the empty sequence', () => {
			const xpathSequence = adaptJavaScriptValueToXPathValue(null);
			chai.assert(xpathSequence.isEmpty(), 'is the empty sequence');
		});

		it('can automatically convert arrays', () => {
			const xpathSequence = adaptJavaScriptValueToXPathValue([], 'item()');
			chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
			chai.assert(xpathSequence.first().type === ('array(*)'), 'is an array');
		});
	});
});
