import NameTest from 'fontoxpath/selectors/tests/NameTest';

describe('NameTest.getBucket()', () => {
	it('returns name-{{name}} when passed a nodeName', () => {
		chai.assert.equal(new NameTest(null, null, 'someNode').getBucket(), 'name-someNode');
	});

	it('returns type-1 when passed * and a kind ("is element(XXX")")', () => {
		chai.assert.equal(new NameTest(null, null, '*', {kind: 1}).getBucket(), 'type-1');
	});
});
