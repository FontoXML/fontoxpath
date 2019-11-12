import * as chai from 'chai';
import { evaluateXPath, evaluateXPathToBoolean, evaluateXPathToString } from 'fontoxpath';
import * as slimdom from 'slimdom';

let documentNode: slimdom.Document;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('functions over functions', () => {
	describe('function-lookup', () => {
		it('returns "bcd"', () => {
			chai.assert.deepEqual(
				evaluateXPathToString(
					`fn:function-lookup(xs:QName('fn:substring'), 2)('abcd', 2)`,
					documentNode,
					null,
					null,
					{
						language: evaluateXPath.XQUERY_3_1_LANGUAGE
					}
				),
				'bcd'
			);
		});

		it('can look up a function that is declared locally', () => {
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					`
declare function Q{ns}myFunc() as xs:integer {1};

function-lookup(QName("ns", "myFunc"), 0) => exists()`,
					documentNode,
					null,
					null,
					{
						language: evaluateXPath.XQUERY_3_1_LANGUAGE
					}
				)
			);
		});

		it('returns an empty sequence if no known function can be identified by name and arity', () => {
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					`fn:function-lookup(xs:QName('fn:unknownFunction'), 2) => empty()`,
					documentNode,
					null,
					null,
					{
						language: evaluateXPath.XQUERY_3_1_LANGUAGE
					}
				)
			);
		});
	});

	describe('function-name', () => {
		it('returns "fn:QName("http://www.w3.org/2005/xpath-functions", "fn:substring""', () => {
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					`fn:function-name(fn:substring#2) = fn:QName("http://www.w3.org/2005/xpath-functions", "substring")`,
					documentNode,
					null,
					null,
					{
						language: evaluateXPath.XQUERY_3_1_LANGUAGE
					}
				)
			);
		});

		it('returns empty sequence for a dynamic function', () => {
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					`fn:function-name(function($node){count($node/*)}) => empty()`,
					documentNode,
					null,
					null,
					{
						language: evaluateXPath.XQUERY_3_1_LANGUAGE
					}
				)
			);
		});

		it('returns empty sequence for a bound function', () => {
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					`fn:function-name(fn:concat("1","2",?,"3")) => empty()`,
					documentNode,
					null,
					null,
					{
						language: evaluateXPath.XQUERY_3_1_LANGUAGE
					}
				)
			);
		});

		it('returns get for a get function', () => {
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					`let $week := map{0:"Sonntag", 1:"Montag", 2:"Dienstag", 3:"Mittwoch"} return fn:function-name($week) = fn:QName("http://www.w3.org/2005/xpath-functions/map", "get")`,
					documentNode,
					null,
					null,
					{
						language: evaluateXPath.XQUERY_3_1_LANGUAGE
					}
				)
			);
		});

		it('returns empty sequence for fn:random-number-generator()("next")', () => {
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					`fn:function-name(fn:random-number-generator()("next")) => empty()`,
					documentNode,
					null,
					null,
					{
						language: evaluateXPath.XQUERY_3_1_LANGUAGE
					}
				)
			);
		});

		it('returns empty sequence for fn:random-number-generator()("permute")', () => {
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					`fn:function-name(fn:random-number-generator()("permute")) => empty()`,
					documentNode,
					null,
					null,
					{
						language: evaluateXPath.XQUERY_3_1_LANGUAGE
					}
				)
			);
		});
	});

	describe('function-arity', () => {
		it('returns 2 for "fn:function-arity(fn:substring#2)"', () => {
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					`fn:function-arity(fn:substring#2) = 2`,
					documentNode,
					null,
					null,
					{
						language: evaluateXPath.XQUERY_3_1_LANGUAGE
					}
				)
			);
		});

		it('returns 1 for "fn:function-arity(fn:substring#2)"', () => {
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					`fn:function-arity(function($node){name($node)}) = 1`,
					documentNode,
					null,
					null,
					{
						language: evaluateXPath.XQUERY_3_1_LANGUAGE
					}
				)
			);
		});

		it('returns 1 for "let $initial := fn:substring(?, 1, 1) return fn:function-arity($initial)"', () => {
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					`let $initial := fn:substring(?, 1, 1) return fn:function-arity($initial) = 1`,
					documentNode,
					null,
					null,
					{
						language: evaluateXPath.XQUERY_3_1_LANGUAGE
					}
				)
			);
		});
	});
});
