import * as chai from 'chai';
import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

import { ReturnType } from 'fontoxpath';
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
			[documentNode]
		);
	});
});
