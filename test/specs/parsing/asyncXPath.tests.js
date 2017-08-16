import * as slimdom from 'slimdom';

import {
	evaluateXPath
} from 'fontoxpath';

import xqueryFile from 'text-loader!./asyncXPath.xq';

describe('asynchronous XPaths', () => {
	let documentNode;
	beforeEach(() => {
		documentNode = new slimdom.Document();
	});

	it('can run XPath expressions asynchronously', async () => {
		const items = [];
		const it = evaluateXPath('fontoxpath:sleep((), 10)', null, null, null, evaluateXPath.ASYNC_ITERATOR_TYPE);

		for (let value = await it.next(); !value.done; value = await it.next()) {
			items.push(value.value);
		}

		chai.assert(items.length === 0);
	});

	it('can resolve async results', async () => {
		const items = [];
		const it = evaluateXPath('fontoxpath:sleep(true(), 10)', null, null, null, evaluateXPath.ASYNC_ITERATOR_TYPE);

		for (let value = await it.next(); !value.done; value = await it.next()) {
			items.push(value.value);
		}

		chai.assert(items.length === 1);
		chai.assert(items[0] === true);
	});

	it('fetch stuff', async () => {
		const items = [];
		const it = evaluateXPath('fontoxpath:fetch("https://raw.githubusercontent.com/LeoWoerteler/QT3TS/master/catalog.xml", map{"method": "get"})', null, null, null, evaluateXPath.ASYNC_ITERATOR_TYPE);

		for (let value = await it.next(); !value.done; value = await it.next()) {
			items.push(value.value);
		}
		chai.assert(items.length === 1);
	});

	it('can run XPath tests using a load of indirection', async () => {
		const items = [];
		const it = evaluateXPath(xqueryFile, null, null, null, evaluateXPath.ASYNC_ITERATOR_TYPE);
		try {
			for (let value = await it.next(); !value.done; value = await it.next()) {
				items.push(value.value);
			}
		} catch (err) {
			chai.assert.isTrue(err.message.includes('FOCA0003'));
		}
	});
});
