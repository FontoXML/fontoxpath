import { getBucketsForNode } from 'fontoxpath';
import * as slimdom from 'slimdom';
const doc = new slimdom.Document();
describe('getBucketsForNode', () => {
	it('returns the correct buckets for elements', () => {
		chai.assert.deepEqual(getBucketsForNode(doc.createElement('element')), ['type-1', 'name-element']);
	});
	it('returns the correct buckets for text nodes', () => {
		chai.assert.deepEqual(getBucketsForNode(doc.createTextNode('A piece of text')), ['type-3']);
	});
});
