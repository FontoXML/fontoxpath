import VarRef from 'fontoxpath/selectors/VarRef';

describe('VarRef.equals()', () => {
	it('returns true if compared with itself', () => {
		const varRef1 = new VarRef('value'),
			varRef2 = varRef1;
		chai.assert.isTrue(varRef1.equals(varRef2));
		chai.assert.isTrue(varRef2.equals(varRef1));
	});

	it('it returns true if compared with an equal other VarRef', () => {
		const varRef1 = new VarRef('value'),
			varRef2 = new VarRef('value');
		chai.assert.isTrue(varRef1.equals(varRef2));
		chai.assert.isTrue(varRef2.equals(varRef1));
	});

	it('it returns false if compared with an unequal other VarRef', () => {
		const varRef1 = new VarRef('value1'),
			varRef2 = new VarRef('value2');
		chai.assert.isFalse(varRef1.equals(varRef2));
		chai.assert.isFalse(varRef2.equals(varRef1));
	});
});
