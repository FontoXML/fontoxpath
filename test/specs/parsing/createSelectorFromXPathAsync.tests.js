import * as slimdom from 'slimdom';

import {
	precompileXPath,
	evaluateXPathToNumber
} from 'fontoxpath';

describe('createSelectorFromXPathAsync', () => {
	let documentNode;
	beforeEach(() => {
		documentNode = new slimdom.Document();
	});

	it('can compile a selector asynchronously', () => {
		return precompileXPath('1 + 1')
			.then(function (selector) {
				// Assume selector to be ok
				chai.expect(
					evaluateXPathToNumber(selector, documentNode, null, {}, evaluateXPathToNumber.NUMBER_TYPE)
				).to.equal(2);
			});
	}).timeout(10000);

	it('can compile a new, unique selector asynchronously', () => {
		const now = Date.now();
		return precompileXPath(`1 + ${now}`)
			.then(function (selector) {
				// Assume selector to be ok
				chai.assert.equal(evaluateXPathToNumber(selector, documentNode), now + 1);
			});
	}).timeout(10000);

	it('throws when compilation fails', () => {
		return precompileXPath(']] Not valid at all! [[')
			.then(function (_selector) {
				chai.expect.fail();
			}, function (error) {
				chai.expect(error).to.be.instanceOf(Error);
			});
	}).timeout(10000);
});
