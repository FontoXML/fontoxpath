import * as slimdom from 'slimdom';

import {
	evaluateXPathToFirstNode,
	evaluateXPathToBoolean,
	evaluateXPathToString
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('DirElementConstructor', () => {
	it('can create an element', () => {
		chai.assert.equal(evaluateXPathToFirstNode('<element/>', documentNode, undefined, {}, { language: 'XQuery3.1' }).nodeType, 1);
	});
	it('Sets the correct name', () => {
		chai.assert.isTrue(evaluateXPathToBoolean('<element/> => name() = "element"', documentNode, undefined, {}, { language: 'XQuery3.1' }));
	});
	it('Sets attributes', () => {
		chai.assert.isTrue(evaluateXPathToBoolean('(<element attr="value"/>)/@attr = "value"', documentNode, undefined, {}, { language: 'XQuery3.1' }));
	});
	it('May use inner expressions', () => {
		chai.assert.isTrue(evaluateXPathToBoolean('(<element attr="{"value"}"/>)/@attr = "value"', documentNode, undefined, {}, { language: 'XQuery3.1' }));
	});
	it('Joins inner expressions using spaces', () => {
		chai.assert.isTrue(evaluateXPathToBoolean('(<element attr="{(1,2,3)}"/>)/@attr = "1 2 3"', documentNode, undefined, {}, { language: 'XQuery3.1' }));
	});
	it('Allows mixing inner expressions and direct attributes', () => {
		chai.assert.isTrue(evaluateXPathToBoolean('(<element attr="1 2 3 {(4,5,6)} 7 8 9"/>)/@attr = "1 2 3 4 5 6 7 8 9"', documentNode, undefined, {}, { language: 'XQuery3.1' }));
	});

	it('Trims boundary spaces', () => {
		chai.assert.isTrue(evaluateXPathToBoolean('<a> {"A A A"} <a> B B B </a>  {"A A A"}  </a>/string() = "A A A B B B A A A"', documentNode, undefined, {}, { language: 'XQuery3.1' }));
	});

	it('Parses character references with decimal points', () => {
		chai.assert.isTrue(evaluateXPathToBoolean('<a>&#32;</a>/string() = " "', documentNode, undefined, {}, { language: 'XQuery3.1' }));
	});
	it('Parses character references with hexadecimal points', () => {
		chai.assert.isTrue(evaluateXPathToBoolean('<a>&#x20;</a>/string() = " "', documentNode, undefined, {}, { language: 'XQuery3.1' }));
	});

	it('correctly handles multiple textNodes', () => {
		chai.assert.equal(evaluateXPathToFirstNode('<e>{1}A{1}</e>', documentNode, undefined, {}, { language: 'XQuery3.1' }).outerHTML, '<e>1A1</e>');
	});

	it('accepts CDataSections', () => {
		chai.assert.equal(evaluateXPathToFirstNode('<e><![CDATA[Some CDATA]]></e>', documentNode, undefined, {}, { language: 'XQuery3.1' }).outerHTML, '<e>Some CDATA</e>');
	});

	it('accepts CDataSections with newlines', () => {
		chai.assert.isTrue(evaluateXPathToBoolean('<e><![CDATA[\n]]></e> eq "&#xA;"', documentNode, undefined, {}, { language: 'XQuery3.1' }));
	});

});
