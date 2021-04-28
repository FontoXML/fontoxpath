import * as chai from 'chai';

import { evaluateXPathToNumber } from 'fontoxpath';

describe('indexOf', () => {
	it('determine a single index', () =>
		chai.assert.equal(evaluateXPathToNumber('index-of(1, 1)'), 1));

	it('determine a single index in two values', () =>
		chai.assert.equal(evaluateXPathToNumber('index-of((1, 2), 2)'), 2));

	it('determine a single index in a string set', () =>
		chai.assert.equal(evaluateXPathToNumber('index-of(("Hey", "Hola", "Hi"), "Hola")'), 2));
});
