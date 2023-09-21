import * as chai from 'chai';
import { evaluateXPath, ReturnType } from 'fontoxpath';
import { parseXmlDocument } from 'slimdom';
import evaluateXPathWithJsCodegen from './evaluateXPathWithJsCodegen';

describe('compare attributes tests', () => {
	const xml = parseXmlDocument(`<xml>
    <title>xpath.playground.fontoxml.com</title>
    <summary>This is a learning tool for XML, XPath and XQuery.</summary>
    <tips>
      <tip id='edit'>You can edit everything on the left</tip>
      <tip id='examples'>You can access more examples from a menu in the top right</tip>
      <tip id='examples'>Another button there lets you share your test using an URL</tip>
    </tips>
    </xml>`);

	it('test simple attribute compare', () => {
		const normalEvaluation = evaluateXPath(
			"/xml/tips/tip[@id = 'edit']",
			xml,
			null,
			null,
			ReturnType.NODES,
		);

		const jsCodegenEvaluation = evaluateXPathWithJsCodegen(
			"/xml/tips/tip[@id = 'edit']",
			xml,
			null,
			ReturnType.NODES,
		);
		chai.assert.equal(normalEvaluation.length, jsCodegenEvaluation.length);
		chai.assert.equal(normalEvaluation.length, 1);
		chai.assert.equal(normalEvaluation[0], jsCodegenEvaluation[0]);
	});

	it('test simple 2 attributes compare', () => {
		const normalEvaluation = evaluateXPath(
			"/xml/tips/tip[@id = 'examples']",
			xml,
			null,
			null,
			ReturnType.NODES,
		);

		const jsCodegenEvaluation = evaluateXPathWithJsCodegen(
			"/xml/tips/tip[@id = 'examples']",
			xml,
			null,
			ReturnType.NODES,
		);
		chai.assert.equal(normalEvaluation.length, jsCodegenEvaluation.length);
		chai.assert.equal(normalEvaluation.length, 2);
		chai.assert.equal(normalEvaluation[0], jsCodegenEvaluation[0]);
		chai.assert.equal(normalEvaluation[1], jsCodegenEvaluation[1]);
	});

	it('test simple 0 attributes compare', () => {
		const normalEvaluation = evaluateXPath(
			"/xml/tips/tip[@id = 'help']",
			xml,
			null,
			null,
			ReturnType.NODES,
		);

		const jsCodegenEvaluation = evaluateXPathWithJsCodegen(
			"/xml/tips/tip[@id = 'help']",
			xml,
			null,
			ReturnType.NODES,
		);
		chai.assert.equal(normalEvaluation.length, jsCodegenEvaluation.length);
		chai.assert.equal(normalEvaluation.length, 0);
	});

	it('test simple 2 attributes valuecompare', () => {
		const normalEvaluation = evaluateXPath(
			"/xml/tips/tip[@id eq 'examples']",
			xml,
			null,
			null,
			ReturnType.NODES,
		);

		const jsCodegenEvaluation = evaluateXPathWithJsCodegen(
			"/xml/tips/tip[@id eq 'examples']",
			xml,
			null,
			ReturnType.NODES,
		);
		chai.assert.equal(normalEvaluation.length, jsCodegenEvaluation.length);
		chai.assert.equal(normalEvaluation.length, 2);
		chai.assert.equal(normalEvaluation[0], jsCodegenEvaluation[0]);
		chai.assert.equal(normalEvaluation[1], jsCodegenEvaluation[1]);
	});

	it('handles absent attributes correctly', () => {
		const jsCodegenEvaluation = evaluateXPathWithJsCodegen(
			"@absent eq 'value'",
			xml,
			null,
			ReturnType.BOOLEAN,
		);
		chai.assert.isFalse(jsCodegenEvaluation);
	});

	it('does not make absent attributes equal to the empty string', () => {
		const jsCodegenEvaluation = evaluateXPathWithJsCodegen(
			"@absent eq ''",
			xml,
			null,
			ReturnType.BOOLEAN,
		);
		chai.assert.isFalse(jsCodegenEvaluation);
	});
});
