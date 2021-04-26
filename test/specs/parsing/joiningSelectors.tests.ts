import { Document, Element } from 'slimdom';
import { parseScript, evaluateXPathToFirstNode, evaluateXPath } from 'fontoxpath';
import * as chai from 'chai';

describe('ast manipulation', () => {
	it('Can run a query from its AST', () => {
		it('can join two selectors using AST manipulation. Proof of concept', () => {
			const selector = 'true()';

			const ast = parseScript(selector, {}, new Document());

			chai.assert.isTrue(evaluateXPath(ast as any, null, null, null, evaluateXPath.BOOLEAN_TYPE));
		});

	});
	describe('joining two selectors', () => {
		it('can join two selectors using AST manipulation. Proof of concept', () => {
			const selector1 = 'true()';
			const selector2 = 'false() or $OTHER_PART';

			const ast1 = parseScript(selector1, {}, new Document());
			const ast2 = parseScript(selector2, {}, new Document());

			debugger;
			const variableNode = evaluateXPathToFirstNode<Element>(
				'descendant::*:varRef',
				ast2
			);
			chai.assert.isOk(variableNode, 'There must be a variable reference');

			const queryBody = evaluateXPathToFirstNode<Element>(
				'descendant::*:queryBody/*',
				ast1
			);
			chai.assert.isOk(queryBody, 'There must be a query body');

			variableNode.parentNode.replaceChild(queryBody, variableNode);

			chai.assert.isTrue(evaluateXPath(ast2 as any, null, null, null, evaluateXPath.BOOLEAN_TYPE));
		});
	});
});
