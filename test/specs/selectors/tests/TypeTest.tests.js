import TypeTest from 'fontoxml-selectors/selectors/tests/TypeTest';

describe('TypeTest.equals()', () => {
	it('returns true if compared with itself', () => {
		const typeTest1 = new TypeTest('type'),
			typeTest2 = typeTest1;
		chai.expect(typeTest1.equals(typeTest2)).to.equal(true);
		chai.expect(typeTest2.equals(typeTest1)).to.equal(true);
	});

	it('it returns true if compared with an equal other TypeTest', () => {
		const typeTest1 = new TypeTest('type'),
			typeTest2 = new TypeTest('type');
		chai.expect(typeTest1.equals(typeTest2)).to.equal(true);
		chai.expect(typeTest2.equals(typeTest1)).to.equal(true);
	});

	it('it returns false if compared with an unequal other TypeTest', () => {
		const typeTest1 = new TypeTest('type1'),
			typeTest2 = new TypeTest('type2');
		chai.expect(typeTest1.equals(typeTest2)).to.equal(false);
		chai.expect(typeTest2.equals(typeTest1)).to.equal(false);
	});
});
