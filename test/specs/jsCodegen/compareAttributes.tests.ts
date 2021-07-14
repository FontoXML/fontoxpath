import evaluateXPathWithJsCodegen from './evaluateXPathWithJsCodegen';
import { sync } from 'slimdom-sax-parser';
import * as slimdom from 'slimdom';
import { evaluateXPath, ReturnType } from 'fontoxpath';

describe('compare attributes tests', () => {
	let xml = sync(`<xml>
    <title>xpath.playground.fontoxml.com</title>
    <summary>This is a learning tool for XML, XPath and XQuery.</summary>
    <tips>
      <tip id='edit'>You can edit everything on the left</tip>
      <tip id='examples'>You can access more examples from a menu in the top right</tip>
      <tip id='permalink'>Another button there lets you share your test using an URL</tip>
    </tips>
    </xml>`);

	it('test simple attribute compare', () => {
		const normalEvaluation = new slimdom.XMLSerializer().serializeToString(
			evaluateXPath("//tip[@id='edit']", xml, null)
		);

		// const jsCodegenEvaluation = new slimdom.XMLSerializer().serializeToString(
		// 	evaluateXPathWithJsCodegen("//tip[@id='edit']", xml, null, ReturnType.NODES)
		// );

		// chai.assert.equal(normalEvaluation, jsCodegenEvaluation);
	});
});
