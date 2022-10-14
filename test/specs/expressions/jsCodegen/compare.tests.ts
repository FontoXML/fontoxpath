import * as chai from 'chai';
import { evaluateXPathToBoolean, ReturnType } from 'fontoxpath';
import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';
import evaluateXPathWithJsCodegen from '../../parsing/jsCodegen/evaluateXPathWithJsCodegen';

describe('compare tests', () => {
	let documentNode: slimdom.Document;
	beforeEach(() => {
		documentNode = new slimdom.Document();
		jsonMlMapper.parse(['xml', { attr: 'true' }], documentNode);
	});

	it('does not generate compare function for nodes', () => {
		const node = documentNode.documentElement;
		const query = '@attr << @attr';

		chai.assert.throws(
			() => evaluateXPathWithJsCodegen(query, node, null, ReturnType.BOOLEAN),
			'Unsupported compare type'
		);

		chai.assert.equal(evaluateXPathToBoolean(query, node), true);
	});
});
