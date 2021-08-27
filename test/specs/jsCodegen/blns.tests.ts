import * as chai from 'chai';
import { evaluateXPath, ReturnType } from 'fontoxpath';
import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';
import evaluateXPathWithJsCodegen from './evaluateXPathWithJsCodegen';

describe('Big List of Naughty Strings tests for JSCodegen', () => {
	let documentNode: slimdom.Document;
	beforeEach(() => {
		documentNode = new slimdom.Document();
		jsonMlMapper.parse(['xml', 'Hello'], documentNode);
	});

	it('BLNS equality', () => {
		const blns = require('blns');
		for (const badString of blns) {
			const literalQuery = '"' + badString + '"';

			try {
				const normalRes = evaluateXPath(
					literalQuery,
					documentNode,
					null,
					null,
					ReturnType.STRING,
					{}
				);
				const jsCodegenRes = evaluateXPathWithJsCodegen(
					literalQuery,
					documentNode,
					null,
					ReturnType.STRING,
					{}
				);

				chai.assert.equal(jsCodegenRes, normalRes);
			} catch (errEval) {
				try {
					evaluateXPathWithJsCodegen(
						literalQuery,
						documentNode,
						null,
						ReturnType.STRING,
						{}
					);
					chai.assert.fail(
						`BLNS literal ${literalQuery} errored during evaluation but not during JS Codegen.`
					);
				} catch (errJs) {
					// Only comparing the string representations, since the stack traces will differ.
					chai.assert.equal(errEval.toString(), errJs.toString());
				}
			}
		}
	});
});
