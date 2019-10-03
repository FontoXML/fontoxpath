import * as chai from 'chai';
import * as slimdom from 'slimdom';

import { evaluateUpdatingExpression } from 'fontoxpath';
import assertUpdateList from './assertUpdateList';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('Updating functions', () => {
	it('allows functions to return a PUL', async () => {
		const result = await evaluateUpdatingExpression(
			`
declare default function namespace "xxx";

declare %updating function xxx ($root) {
  insert node <a>I've been inserted.</a> into $root
};

xxx(/)
`,
			documentNode,
			null,
			{},
			{}
		);

		chai.assert.deepEqual(result.xdmValue, []);
		assertUpdateList(result.pendingUpdateList, [
			{
				type: 'insertInto',
				source: "<a>I've been inserted</a>",
				target: documentNode
			}
		]);
	});
});
