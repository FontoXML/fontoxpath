import TypeTest from 'fontoxpath/selectors/tests/TypeTest';

describe('TypeTest.equals()', () => {
	it('returns true if compared with itself', () => {
		const typeTest1 = new TypeTest('type'),
			typeTest2 = typeTest1;
		chai.assert.isTrue(typeTest1.equals(typeTest2));
		chai.assert.isTrue(typeTest2.equals(typeTest1));
	});

	it('it returns true if compared with an equal other TypeTest', () => {
		const typeTest1 = new TypeTest('type'),
			typeTest2 = new TypeTest('type');
		chai.assert.isTrue(typeTest1.equals(typeTest2));
		chai.assert.isTrue(typeTest2.equals(typeTest1));
	});

	it('it returns false if compared with an unequal other TypeTest', () => {
		const typeTest1 = new TypeTest('type1'),
			typeTest2 = new TypeTest('type2');
		chai.assert.isFalse(typeTest1.equals(typeTest2));
		chai.assert.isFalse(typeTest2.equals(typeTest1));
	});
});
