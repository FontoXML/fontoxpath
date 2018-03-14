import * as slimdom from 'slimdom';

import {
	evaluateXPathToString,
	evaluateXPathToBoolean
} from 'fontoxpath';

let documentNode;
beforeEach(() => documentNode = new slimdom.Document());

describe('Integer literal', () => {
	it('results in an integer',
		() => chai.assert(evaluateXPathToBoolean('10 instance of xs:integer', documentNode)));
	it('disallows directly adjacent operators',
		() => chai.assert.throws(() => evaluateXPathToBoolean('10div10', documentNode), 'XPST0003'));
});

describe('Decimal literal', () => {
	it('results in a decimal',
		() => chai.assert(evaluateXPathToBoolean('10.0 instance of xs:decimal', documentNode)));
	it('disallows directly adjacent operators',
		() => chai.assert.throws(() => evaluateXPathToBoolean('10.0div10.0', documentNode), 'XPST0003'));
});

describe('Double literal', () => {
	it('results in a decimal',
		() => chai.assert(evaluateXPathToBoolean('10.0e10 instance of xs:double', documentNode)));
	it('disallows directly adjacent operators before',
		() => chai.assert.throws(() => evaluateXPathToBoolean('10.0e10div 10.0e10', documentNode), 'XPST0003'));
	it('disallows directly adjacent operators after',
		() => chai.assert.throws(() => evaluateXPathToBoolean('10.0e10 div10.0e10', documentNode), 'XPST0003'));
	it('disallows directly adjacent binary operators after',
		() => chai.assert.throws(() => evaluateXPathToBoolean('10.0e10 eq10.0e10', documentNode), 'XPST0003'));
	it('disallows directly adjacent compares after',
		() => chai.assert.throws(() => evaluateXPathToBoolean('10.0e10 eq10.0e10', documentNode), 'XPST0003'));
});

describe('String literal', () => {
	it('results in a string',
		() => chai.assert(evaluateXPathToBoolean('"Some text" instance of xs:string', documentNode)));
	it('Allows escaping quotes',
		() => chai.assert.equal(evaluateXPathToString('"Some "" text"', documentNode), 'Some " text'));
	it('Allows escaping apostrophes',
		() => chai.assert.equal(evaluateXPathToString(`'Some '' text'`, documentNode), `Some ' text`));
	it('allows directly adjacent operators',
		() => chai.assert.equal(evaluateXPathToBoolean('"some"instance of xs:string', documentNode), true));
	it('allows directly adjacent compares operators',
		() => chai.assert.throws(() => evaluateXPathToBoolean('"s"is"s"', documentNode), 'XPTY0004'));
	it('transforms entity references in XQuery mode', () => {
		chai.assert.equal(evaluateXPathToString('"&amp;"', documentNode, null, {}, { language: 'XQuery3.1' }), '&');
	});
	it('does not transform entity references in XPath mode', () => {
		chai.assert.equal(evaluateXPathToString('"&amp;"', documentNode, null, {}, { language: 'XPath3.1' }), '&amp;');
	});
});
