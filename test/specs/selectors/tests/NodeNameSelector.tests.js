import NodeNameSelector from 'fontoxpath/selectors/tests/NodeNameSelector';

describe('NodeNameSelector.getBucket()', () => {
	it('returns name-{{name}} when passed a nodeName', () => {
		chai.assert.equal(new NodeNameSelector('someNode').getBucket(), 'name-someNode');
	});

	it('returns type-1 when passed *', () => {
		chai.assert.equal(new NodeNameSelector('*').getBucket(), 'type-1');
	});
});
