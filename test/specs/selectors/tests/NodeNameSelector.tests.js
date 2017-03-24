import NodeNameSelector from 'fontoxpath/selectors/tests/NodeNameSelector';

describe('NodeNameSelector.equals()', () => {
	it('returns true if compared with itself', () => {
		const nodeNameSelector1 = new NodeNameSelector('nodeName'),
			nodeNameSelector2 = nodeNameSelector1;
		chai.assert.isTrue(nodeNameSelector1.equals(nodeNameSelector2));
		chai.assert.isTrue(nodeNameSelector2.equals(nodeNameSelector1));
	});

	it('it returns true if compared with an equal other NodeNameSelector', () => {
		const nodeNameSelector1 = new NodeNameSelector('nodeName'),
			nodeNameSelector2 = new NodeNameSelector('nodeName');
		chai.assert.isTrue(nodeNameSelector1.equals(nodeNameSelector2));
		chai.assert.isTrue(nodeNameSelector2.equals(nodeNameSelector1));
	});

	it('it returns false if compared with an unequal other NodeNameSelector', () => {
		const nodeNameSelector1 = new NodeNameSelector('nodeName1'),
			nodeNameSelector2 = new NodeNameSelector('nodeName2');
		chai.assert.isFalse(nodeNameSelector1.equals(nodeNameSelector2));
		chai.assert.isFalse(nodeNameSelector2.equals(nodeNameSelector1));
	});
});

describe('NodeNameSelector.getBucket()', () => {
	it('returns name-{{name}} when passed a nodeName', () => {
		chai.assert.equal(new NodeNameSelector('someNode').getBucket(), 'name-someNode');
	});

	it('returns type-1 when passed *', () => {
		chai.assert.equal(new NodeNameSelector('*').getBucket(), 'type-1');
	});
});
