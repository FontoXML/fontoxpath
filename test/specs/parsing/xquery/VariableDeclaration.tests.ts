import * as chai from 'chai';
import { evaluateXPath, evaluateXPathToBoolean } from 'fontoxpath';
import evaluateXPathToNumber from 'fontoxpath/evaluateXPathToNumber';
import evaluateXPathToString from "fontoxpath/evaluateXPathToString";
import * as slimdom from 'slimdom';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('VariableDeclaration', () => {
	it('create a variable declaration', () => {
		chai.assert.isTrue(
			evaluateXPathToBoolean(
				`declare variable $x := 3;
                (: Return x from the module :)
                $x`,
				documentNode,
				undefined,
				{},
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE })
		);
	});
	it('create a more complex variable declaration', () => {
		chai.assert.equal(
			evaluateXPathToNumber(
				`declare variable $x := 3+4;
                (: Return x from the module :)
                $x`,
				documentNode,
				undefined,
				{},
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }), 7);
	});

	it('create a more complex variable declaration using variables', () => {
		chai.assert.equal(
			evaluateXPathToNumber(
				`declare variable $x := 1;
                declare variable $y := $x + 1;
                (: Return x from the module :)
                $y`,
				documentNode,
				undefined,
				{},
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }), 2);
	});
	it('create a more complex variable declaration using variables', () => {
		chai.assert.equal(
			evaluateXPathToString(
				`declare variable $x := 'hello';
                (: Return x from the module :)
                $x`,
				documentNode,
				undefined,
				{},
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }), 'hello');
	});

	it('allows external variables with defaults', () => {
		chai.assert.equal(
			evaluateXPathToString(
				`declare variable $nx as xs:integer external := 12; 
                <out>{$nx}</out>`,
				documentNode,
				undefined,
				{},
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }), '12');
	});

	it('allows external variables with defaults (using the same variable)', () => {
		// we are checking that the var is not cached from the previous test
		chai.assert.equal(
			evaluateXPathToString(
				`declare variable $nx as xs:integer external := 12; 
                <out>{$nx}</out>`,
				documentNode,
				undefined,
				{ nx: 44 },
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }), '44');
	});

	it('allows external variables with defaults and external parameters', () => {
		chai.assert.equal(
			evaluateXPathToString(
				`declare variable $nxa as xs:integer external := 10; 
                <out>{$nxa}</out>`,
				documentNode,
				undefined,
				{ nxa: 33 },
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }), '33');
	});

	it('Inline function accessing global variable in XQuery', () => {
		chai.assert.equal(
			evaluateXPathToNumber(
				` declare variable $p as xs:integer external;
                 declare variable $f := function($a) {$a + $p};
                 $f(12)`,
				documentNode,
				undefined,
				{ p: 7 },
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }), 19);
	});
});
