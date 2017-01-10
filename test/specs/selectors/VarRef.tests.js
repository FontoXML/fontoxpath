import VarRef from 'fontoxpath/selectors/VarRef';

describe('VarRef.equals()', () => {
	it('returns true if compared with itself', () => {
		const varRef1 = new VarRef('value'),
			varRef2 = varRef1;
		chai.expect(varRef1.equals(varRef2)).to.equal(true);
		chai.expect(varRef2.equals(varRef1)).to.equal(true);
	});

	it('it returns true if compared with an equal other VarRef', () => {
		const varRef1 = new VarRef('value'),
			varRef2 = new VarRef('value');
		chai.expect(varRef1.equals(varRef2)).to.equal(true);
		chai.expect(varRef2.equals(varRef1)).to.equal(true);
	});

	it('it returns false if compared with an unequal other VarRef', () => {
		const varRef1 = new VarRef('value1'),
			varRef2 = new VarRef('value2');
		chai.expect(varRef1.equals(varRef2)).to.equal(false);
		chai.expect(varRef2.equals(varRef1)).to.equal(false);
	});
});
