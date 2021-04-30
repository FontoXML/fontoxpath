import * as chai from 'chai';
import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

import { evaluateXPathToNodes } from 'fontoxpath';

describe('paths (js-codegen)', () => {
	const documentNode = new slimdom.Document();
	it('compiles (/)', () => {
		jsonMlMapper.parse(['xml', ['title']], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('(/)', documentNode, undefined, undefined, {backend: 'js-codegen'}), [documentNode]);
	});
});
