import slimdom from 'slimdom';

import { domFacade } from 'fontoxpath';
import { evaluateXPathToNumber, evaluateXPathToStrings } from 'fontoxpath';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('mathematical operators', () => {
	it('can evaluate 1 + 1 to 2', () => {
		const selector = ('1 + 1');
		chai.expect(
			evaluateXPathToNumber(selector, documentNode, domFacade)
		).to.equal(2);
	});

	it('can evaluate 1 - 1 to 0', () => {
		const selector = ('1 - 1');
		chai.expect(
			evaluateXPathToNumber(selector, documentNode, domFacade)
		).to.equal(0);
	});

	it('can evaluate 1 * 2 to 2', () => {
		const selector = ('1 * 2');
		chai.expect(
			evaluateXPathToNumber(selector, documentNode, domFacade)
		).to.equal(2);
	});

	it('can evaluate 1 div 2 to 0.5', () => {
		const selector = ('1 div 2');
		chai.expect(
			evaluateXPathToNumber(selector, documentNode, domFacade)
		).to.equal(0.5);
	});

	it('can evaluate 1 idiv 2 to 1', () => {
		const selector = ('1 idiv 2');
		chai.expect(
			evaluateXPathToNumber(selector, documentNode, domFacade)
		).to.equal(0.5);
	});

	it('returns the empty sequence if one of the operands is the empty sequence', () => {
		chai.assert.deepEqual(evaluateXPathToStrings('() + 1', documentNode, domFacade), []);
	});

	it('can evaluate 5 mod 3 to 2', () => {
		const selector = ('5 mod 3');
		chai.expect(
			evaluateXPathToNumber(selector, documentNode, domFacade)
		).to.equal(2);
	});

	it('can evaluate "something" + 1 to NaN', () => {
		const selector = ('"something" + 1');
		chai.expect(
			evaluateXPathToNumber(selector, documentNode, domFacade)
		).to.be.NaN;
	});

	it('can parse untyped attributes', () => {
		const selector = ('@a + 1');
		jsonMlMapper.parse(['someElement',{a:'1'}], documentNode);
		chai.expect(
			evaluateXPathToNumber(selector, documentNode.documentElement, domFacade)
		).to.equal(2);
	});
});
