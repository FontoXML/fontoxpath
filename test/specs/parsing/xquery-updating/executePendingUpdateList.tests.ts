import * as chai from 'chai';
import * as slimdom from 'slimdom';

import { evaluateUpdatingExpressionSync, executePendingUpdateList } from 'fontoxpath';

let documentNode: slimdom.Document;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('executePendingUpdateList', () => {
	it('deletes an attribute in a different namespace than the parent element', () => {
		documentNode = slimdom.parseXmlDocument('<element xmlns:ns1="my-ns" ns1:foo="bar"/>');

		const { pendingUpdateList, xdmValue } = evaluateUpdatingExpressionSync(
			`delete node ./element/@Q{my-ns}foo`,
			documentNode,
			null,
			{},
			{},
		);

		chai.assert.equal(pendingUpdateList.length, 1);

		executePendingUpdateList(pendingUpdateList);

		chai.assert.equal(documentNode.documentElement.outerHTML, '<element xmlns:ns1="my-ns"/>');
	});

	it('renames an element with an attribute in a different namespace', () => {
		documentNode = slimdom.parseXmlDocument('<element xmlns:ns1="my-ns" ns1:foo="bar"/>');

		const { pendingUpdateList, xdmValue } = evaluateUpdatingExpressionSync(
			`rename node ./element as "e"`,
			documentNode,
			null,
			{},
			{},
		);

		chai.assert.equal(pendingUpdateList.length, 1);

		executePendingUpdateList(pendingUpdateList);

		chai.assert.equal(
			documentNode.documentElement.outerHTML,
			'<e xmlns:ns1="my-ns" ns1:foo="bar"/>',
		);
	});

	it('replaces an attribute which is in a namespace', () => {
		documentNode = slimdom.parseXmlDocument('<element xmlns:ns1="my-ns" ns1:foo="bar"/>');

		const { pendingUpdateList, xdmValue } = evaluateUpdatingExpressionSync(
			`replace node ./element/@Q{my-ns}foo with attribute beep { "boop" }`,
			documentNode,
			null,
			{},
			{},
		);

		chai.assert.equal(pendingUpdateList.length, 1);

		executePendingUpdateList(pendingUpdateList);

		chai.assert.equal(
			documentNode.documentElement.outerHTML,
			'<element xmlns:ns1="my-ns" beep="boop"/>',
		);
	});

	it('replaces the value of an attribute which is in a namespace', () => {
		documentNode = slimdom.parseXmlDocument('<element xmlns:ns1="my-ns" ns1:foo="bar"/>');

		const { pendingUpdateList, xdmValue } = evaluateUpdatingExpressionSync(
			`replace value of node ./element/@Q{my-ns}foo with "boop"`,
			documentNode,
			null,
			{},
			{},
		);

		chai.assert.equal(pendingUpdateList.length, 1);

		executePendingUpdateList(pendingUpdateList);

		chai.assert.equal(
			documentNode.documentElement.outerHTML,
			'<element xmlns:ns1="my-ns" ns1:foo="boop"/>',
		);
	});

	it('throws an error when an insert attribute tries to overwrite an existing attribute in a namespace', () => {
		documentNode = slimdom.parseXmlDocument('<element xmlns:ns1="my-ns" ns1:foo="bar"/>');

		const { pendingUpdateList, xdmValue } = evaluateUpdatingExpressionSync(
			`insert node attribute Q{my-ns}foo { "baz" } into ./element`,
			documentNode,
			null,
			{},
			{},
		);

		chai.assert.equal(pendingUpdateList.length, 1);

		chai.assert.throws(() => executePendingUpdateList(pendingUpdateList), 'XUDY0021');
	});

	it('throws an error when an replace attribute tries to overwrite an existing attribute in a namespace', () => {
		documentNode = slimdom.parseXmlDocument(
			'<element xmlns:ns1="my-ns" ns1:foo="bar" beep="boop"/>',
		);

		const { pendingUpdateList, xdmValue } = evaluateUpdatingExpressionSync(
			`replace node ./element/@beep with attribute Q{my-ns}foo { "baz" }`,
			documentNode,
			null,
			{},
			{},
		);

		chai.assert.equal(pendingUpdateList.length, 1);

		chai.assert.throws(() => executePendingUpdateList(pendingUpdateList), 'XUDY0021');
	});
});
