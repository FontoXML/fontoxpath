import * as chai from 'chai';
import * as slimdom from 'slimdom';

import { evaluateUpdatingExpressionSync } from 'fontoxpath';
import assertUpdateList from './assertUpdateList';

let documentNode: slimdom.Document;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('DeleteExpression', () => {
	it('merges pul from target expressions', () => {
		const element = documentNode.appendChild(documentNode.createElement('element'));
		const a = element.appendChild(documentNode.createElement('a'));

		const result = evaluateUpdatingExpressionSync(
			`delete node (/element, delete node /element/a)`,
			documentNode,
			null,
			{},
			{},
		);

		chai.assert.deepEqual(result.xdmValue, []);
		assertUpdateList(result.pendingUpdateList, [
			{
				type: 'delete',
				target: element,
			},
			{
				type: 'delete',
				target: a,
			},
		]);
	});
});
