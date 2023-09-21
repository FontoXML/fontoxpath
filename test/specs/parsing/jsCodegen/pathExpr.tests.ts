import * as chai from 'chai';
import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

import { evaluateXPath, Language, parseScript, ReturnType } from 'fontoxpath';
import evaluateXPathWithJsCodegen from './evaluateXPathWithJsCodegen';

describe('paths (js-codegen)', () => {
	let documentNode: slimdom.Document;

	beforeEach(() => {
		documentNode = new slimdom.Document();
		jsonMlMapper.parse(['xml', ['title']], documentNode);
	});

	it('compiles (/)', () => {
		chai.assert.deepEqual(
			evaluateXPathWithJsCodegen('(/)', documentNode, null, ReturnType.NODES),
			[documentNode],
		);
	});

	it('evaluates absolute paths by going "up" to the document node', () => {
		const titleNode = documentNode.firstChild.firstChild;
		chai.assert.isTrue(
			evaluateXPathWithJsCodegen('/xml/title', titleNode, null, ReturnType.BOOLEAN),
		);
		chai.assert.isFalse(
			evaluateXPathWithJsCodegen('/does-not-exist', titleNode, null, ReturnType.BOOLEAN),
		);
	});

	it('handles paths with filterExpr', () => {
		const titleNode = documentNode.firstChild.firstChild;
		chai.assert.isFalse(
			evaluateXPathWithJsCodegen('self::title/false()', titleNode, null, ReturnType.BOOLEAN),
		);
		// context item is also a filterExpr
		chai.assert.equal(
			evaluateXPathWithJsCodegen('self::title/./.', titleNode, null, ReturnType.FIRST_NODE),
			titleNode,
		);
		// filterExpr with following steps must result in a node
		chai.assert.throws(
			() =>
				evaluateXPathWithJsCodegen(
					'false()/self::title',
					titleNode,
					null,
					ReturnType.BOOLEAN,
				),
			/XPTY0019/,
		);
	});

	it('handles paths with filterExpr with nested paths (single value)', () => {
		// Fonto's xq interpolates expressions using AST manipulation, which may result in
		// having a pathExpr inside of a filterExpr:
		const outerAst = parseScript(
			'$a/*',
			{ language: Language.XQUERY_3_1_LANGUAGE, debug: false },
			new slimdom.Document(),
		);
		const innerAst = parseScript(
			'self::nope',
			{ language: Language.XQUERY_3_1_LANGUAGE, debug: false },
			new slimdom.Document(),
		);
		const actualExpression = evaluateXPath<slimdom.Element, ReturnType.FIRST_NODE>(
			'descendant::Q{http://www.w3.org/2005/XQueryX}queryBody/*',
			innerAst,
			null,
			{},
			ReturnType.FIRST_NODE,
		);
		const expressionToReplace = evaluateXPath<slimdom.Element, ReturnType.FIRST_NODE>(
			`descendant::Q{http://www.w3.org/2005/XQueryX}varRef`,
			outerAst,
			null,
			{},
			ReturnType.FIRST_NODE,
		);
		expressionToReplace.replaceWith(actualExpression);

		chai.assert.equal(
			evaluateXPathWithJsCodegen(
				outerAst,
				documentNode.documentElement,
				null,
				ReturnType.FIRST_NODE,
			),
			null,
		);
	});

	it('handles paths with filterExpr with nested paths (multiple values)', () => {
		// Fonto's xq interpolates expressions using AST manipulation, which may result in
		// having a pathExpr inside of a filterExpr:
		const outerAst = parseScript(
			'$a/*',
			{ language: Language.XQUERY_3_1_LANGUAGE, debug: false },
			new slimdom.Document(),
		);
		const innerAst = parseScript(
			'*',
			{ language: Language.XQUERY_3_1_LANGUAGE, debug: false },
			new slimdom.Document(),
		);
		const actualExpression = evaluateXPath<slimdom.Element, ReturnType.FIRST_NODE>(
			'descendant::Q{http://www.w3.org/2005/XQueryX}queryBody/*',
			innerAst,
			null,
			{},
			ReturnType.FIRST_NODE,
		);
		const expressionToReplace = evaluateXPath<slimdom.Element, ReturnType.FIRST_NODE>(
			`descendant::Q{http://www.w3.org/2005/XQueryX}varRef`,
			outerAst,
			null,
			{},
			ReturnType.FIRST_NODE,
		);
		expressionToReplace.replaceWith(actualExpression);

		chai.assert.equal(
			evaluateXPathWithJsCodegen(outerAst, documentNode, null, ReturnType.FIRST_NODE),
			documentNode.documentElement.firstElementChild,
		);
	});
});
