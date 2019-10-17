import * as chai from 'chai';
import * as slimdom from 'slimdom';

import { evaluateUpdatingExpressionSync, registerXQueryModule } from 'fontoxpath';
import assertUpdateList from './assertUpdateList';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('Updating functions', () => {
	it('allows functions to return a PUL', () => {
		const result = evaluateUpdatingExpressionSync(
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

	it('allows functions in modules to be updating', () => {
		registerXQueryModule(
			`module namespace test="http://www.example.com/ns";
declare %updating function test:xxx ($root) {
  insert node <a>I've been inserted.</a> into $root
};`
		);
		const result = evaluateUpdatingExpressionSync(
			`
import module namespace test="http://www.example.com/ns";

test:xxx(/)
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
