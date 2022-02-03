import * as chai from 'chai';
import {
	evaluateUpdatingExpressionSync,
	evaluateXPathToArray,
	evaluateXPathToBoolean,
	evaluateXPathToFirstNode,
	evaluateXPathToMap,
	evaluateXPathToNumber,
	evaluateXPathToNumbers,
	evaluateXPathToString,
	evaluateXPathToStrings,
	executePendingUpdateList,
	parseScript,
	ReturnType,
} from 'fontoxpath';
import { Document, Element } from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

function namespaceResolver(prefix) {
	switch (prefix) {
		case 'xqx': {
			return 'http://www.w3.org/2005/XQueryX';
		}
		default: {
			return undefined;
		}
	}
}

describe('parseScript', () => {
	it('can parse a script', () => {
		const ast = parseScript('1+1', {}, new Document());

		chai.assert.isOk(ast);
	});

	it('resolve namespaces for nameTests in a script', () => {
		const ast = parseScript(
			`
declare namespace xxx="http://www.example.com/";

self::xxx:element
`,
			{
				annotateAst: true,
			},
			new Document()
		);

		chai.assert.isTrue(
			evaluateXPathToBoolean(
				`descendant::xqx:nameTest/@xqx:URI = "http://www.example.com/"`,
				ast,
				null,
				{},
				{ namespaceResolver }
			)
		);
	});

	it('resolve namespaces for varrefs in a script', () => {
		const ast = parseScript(
			`
declare namespace xxx="http://www.example.com/";

$xxx:yyy
`,
			{
				annotateAst: true,
			},
			new Document()
		);

		chai.assert.isTrue(
			evaluateXPathToBoolean(
				`descendant::xqx:varRef/@xqx:URI = "http://www.example.com/"`,
				ast,
				null,
				{},
				{ namespaceResolver }
			)
		);
	});

	it('resolve namespaces for functionNames in a script', () => {
		const ast = parseScript(
			`
declare namespace xxx="http://www.example.com/";

xxx:some-function()
`,
			{
				annotateAst: true,
			},
			new Document()
		);

		chai.assert.isTrue(
			evaluateXPathToBoolean(
				`descendant::xqx:functionName/@xqx:URI = "http://www.example.com/"`,
				ast,
				null,
				{},
				{ namespaceResolver }
			)
		);
	});

	it('resolve namespaces for named function references in a script', () => {
		const ast = parseScript(
			`
declare namespace xxx="http://www.example.com/";

xxx:some-function#0()
`,
			{
				annotateAst: true,
			},
			new Document()
		);

		chai.assert.isTrue(
			evaluateXPathToBoolean(
				`descendant::xqx:functionName/@xqx:URI = "http://www.example.com/"`,
				ast,
				null,
				{},
				{ namespaceResolver }
			)
		);
	});

	it('resolve namespaces for named function references in a script', () => {
		const ast = parseScript(
			`
declare default function namespace "http://www.example.com/";

some-function#0()
`,
			{
				annotateAst: true,
			},
			new Document()
		);

		chai.assert.isTrue(
			evaluateXPathToBoolean(
				`descendant::xqx:functionName/@xqx:URI = "http://www.example.com/"`,
				ast,
				null,
				{},
				{ namespaceResolver }
			)
		);
	});

	it('can execute an AST, resolving to a number', () => {
		const ast = parseScript('1+1', {}, new Document());
		const result = evaluateXPathToNumber(ast);
		chai.assert.equal(result, 2);
	});

	it('can execute an AST, resolving to boolean', () => {
		const ast = parseScript('2 = 2', {}, new Document());
		const result = evaluateXPathToBoolean(ast);
		chai.assert.isTrue(result);
	});

	it('can parse an AST containing a binary operator', () => {
		const ast = parseScript('2 = 2 and 3 = 3 or 4 = 4', {}, new Document());
		const result = evaluateXPathToBoolean(ast);
		chai.assert.isTrue(result);
	});

	it('can execute an AST, using variables', () => {
		const ast = parseScript('$var', {}, new Document());
		const result = evaluateXPathToBoolean(ast, null, null, { var: true });
		chai.assert.isTrue(result);
	});

	it('can execute an AST, using a mutated AST', () => {
		const ast = parseScript('$FIND_ME + 10', {}, new Document());
		const ast2 = parseScript('32', {}, new Document());

		const FIND_ME = evaluateXPathToFirstNode<Element>(
			'descendant::xqx:varRef[xqx:name = "FIND_ME"]',
			ast,
			null,
			null,
			{ namespaceResolver }
		);
		chai.assert.isOk(FIND_ME, 'varRef should have been found');

		const queryBodyContents = evaluateXPathToFirstNode<Element>(
			'descendant::xqx:queryBody/*',
			ast2,
			null,
			null,
			{ namespaceResolver }
		);
		chai.assert.isOk(queryBodyContents, 'Query body contents should have been found');
		FIND_ME.replaceWith(queryBodyContents);
		const result = evaluateXPathToNumber(ast);
		chai.assert.equal(result, 42);
	});

	it('can reverse a sequence within an AST', () => {
		const ast = parseScript('fn:reverse(("a", "b", "c"))', {}, new Document());
		const result = evaluateXPathToStrings(ast);
		chai.assert.sameOrderedMembers(result, ['c', 'b', 'a']);
	});

	it('can execute an AST, resolving to an array', () => {
		const ast = parseScript('[1,2,3]', {}, new Document());
		const result = evaluateXPathToArray(ast);
		chai.assert.sameOrderedMembers(result, [1, 2, 3]);
	});

	it('can execute a function within an AST', () => {
		const ast = parseScript('array:sort([3,1,2])', {}, new Document());
		const result = evaluateXPathToArray(ast);
		chai.assert.sameOrderedMembers(result, [1, 2, 3]);
	});

	it('can multiply an array of numbers within an AST', () => {
		const ast = parseScript(`fn:for-each(1 to 3, function($a) { $a * 3 })`, {}, new Document());
		const result = evaluateXPathToNumbers(ast);
		chai.assert.deepEqual(result, [3, 6, 9]);
	});

	it('can parse an AST containing a stack trace', () => {
		const document = new Document();
		jsonMlMapper.parse(['foo', ['bar']], document);

		const ast = parseScript(`foo/bar`, { debug: true }, document);

		const result = evaluateXPathToFirstNode(ast, document);
		chai.assert.equal(result, document.documentElement.firstChild);
	});

	it('can parse an AST containing a node insertion', () => {
		const document = new Document();
		document.appendChild(document.createElement('baz'));
		const ast = parseScript('insert node <foo>bar</foo> into /baz', {}, document);

		const result = evaluateUpdatingExpressionSync(ast, document, null, null, {
			returnType: ReturnType.FIRST_NODE,
		});

		chai.assert.isNull(result.xdmValue);

		executePendingUpdateList(result.pendingUpdateList);

		chai.assert.equal(document.documentElement.outerHTML, '<baz><foo>bar</foo></baz>');
	});

	it('can execute a map function within an AST', () => {
		const ast = parseScript('map:put($week, "1", "Monday")', {}, new Document());
		const result = evaluateXPathToMap(ast, null, null, {
			week: { '0': 'Sunday', '1': 'Tuesday' },
		});
		chai.assert.deepEqual(result, { '0': 'Sunday', '1': 'Monday' });
	});

	it('can evaluate whether an item exists in a map within an AST', () => {
		const ast = parseScript(
			`
    let $week := map{"0":"Sunday", "1":"Monday"} return
    if (map:get($week, "1") = "Monday")
        then "it is Monday"
        else "it is not Monday"`,
			{},
			new Document()
		);
		const result = evaluateXPathToString(ast);
		chai.assert.deepEqual(result, 'it is Monday');
	});

	it('can execute a deeper AST', () => {
		const ast = parseScript(
			'"a " || "b " || "a " || "b " || "b " || "a " || "b " || "b " || "a " || "b " || "b " || "a " || "b " || "b " || "a " || "b " || "b " || "a " || "b "',
			{},
			new Document()
		);
		const result = evaluateXPathToString(ast);
		chai.assert.equal(result, 'a b a b b a b b a b b a b b a b b a b ');
	});

	it('prints the error when an expression is broken', () => {
		const ast = parseScript<Element>('1 + 1', {}, new Document());
		chai.assert.throws(() => evaluateXPathToFirstNode(ast), '1 + 1');
	});
});
