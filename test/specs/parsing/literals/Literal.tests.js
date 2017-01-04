import slimdom from 'slimdom';

import { domFacade } from 'fontoxml-selectors';
import { evaluateXPathToString, evaluateXPathToBoolean } from 'fontoxml-selectors';

let documentNode;
beforeEach(() => documentNode = slimdom.createDocument());

describe('Integer literal', () => {
	it('results in an integer',
	   () => chai.assert(evaluateXPathToBoolean('10 instance of xs:integer', documentNode, domFacade)));
	it('disallows directly adjacent operators',
	   () => chai.assert.throws(() => evaluateXPathToBoolean('10div10', documentNode, domFacade), 'XPST0003'));
});

describe('Decimal literal', () => {
	it('results in a decimal',
	   () => chai.assert(evaluateXPathToBoolean('10.0 instance of xs:decimal', documentNode, domFacade)));
	it('disallows directly adjacent operators',
	   () => chai.assert.throws(() => evaluateXPathToBoolean('10.0div10.0', documentNode, domFacade), 'XPST0003'));
});

describe('Double literal', () => {
	it('results in a decimal',
	   () => chai.assert(evaluateXPathToBoolean('10.0e10 instance of xs:double', documentNode, domFacade)));
	it('disallows directly adjacent operators before',
	   () => chai.assert.throws(() => evaluateXPathToBoolean('10.0e10div 10.0e10', documentNode, domFacade), 'XPST0003'));
	it('disallows directly adjacent operators after',
	   () => chai.assert.throws(() => evaluateXPathToBoolean('10.0e10 div10.0e10', documentNode, domFacade), 'XPST0003'));
		it('disallows directly adjacent binary operators after',
	   () => chai.assert.throws(() => evaluateXPathToBoolean('10.0e10 eq10.0e10', documentNode, domFacade), 'XPST0003'));
		it('disallows directly adjacent compares after',
	   () => chai.assert.throws(() => evaluateXPathToBoolean('10.0e10 eq10.0e10', documentNode, domFacade), 'XPST0003'));
});

describe('String literal', () => {
	it('results in a string',
	   () => chai.assert(evaluateXPathToBoolean('"Some text" instance of xs:string', documentNode, domFacade)));
	it('Allows escaping quotes',
	   () => chai.assert.equal(evaluateXPathToString('"Some "" text"', documentNode, domFacade), 'Some " text'));
	it('Allows escaping apostrophes',
	   () => chai.assert.equal(evaluateXPathToString(`'Some '' text'`, documentNode, domFacade), `Some ' text`));
	it('allows directly adjacent operators',
	   () => chai.assert.equal(evaluateXPathToBoolean('"some"instance of xs:string', documentNode, domFacade), true));
	it('allows directly adjacent compares operators',
	   () => chai.assert.throws(() => evaluateXPathToBoolean('"s"is"s"', documentNode, domFacade), 'XPTY0004'));
});
