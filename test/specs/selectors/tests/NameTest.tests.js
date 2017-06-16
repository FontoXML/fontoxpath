import NameTest from 'fontoxpath/selectors/tests/NameTest';

describe('NameTest.getBucket()', () => {
	it('returns name-{{name}} when passed a nodeName', () => {
		chai.assert.equal(new NameTest(null, null, 'someNode').getBucket(), 'name-someNode');
	});

	it('returns type-1 when passed *', () => {
		chai.assert.equal(new NameTest(null, null, '*').getBucket(), 'type-1');
	});
});
