import Literal from 'fontoxpath/selectors/literals/Literal';

describe('Literal.equals()', () => {
	it('returns true if compared with itself', () => {
		const varRef1 = new Literal(1, 'xs:integer'),
			varRef2 = varRef1;
		chai.assert.isTrue(varRef1.equals(varRef2));
		chai.assert.isTrue(varRef2.equals(varRef1));
	});

	it('it returns true if compared with an equal other Literal', () => {
		const varRef1 = new Literal(1, 'xs:integer'),
			varRef2 = new Literal(1, 'xs:integer');
		chai.assert.isTrue(varRef1.equals(varRef2));
		chai.assert.isTrue(varRef2.equals(varRef1));
	});

	it('it returns false if compared with an unequal other Literal', () => {
		const varRef1 = new Literal(1, 'xs:integer'),
			varRef2 = new Literal(2, 'xs:integer');
		chai.assert.isFalse(varRef1.equals(varRef2));
		chai.assert.isFalse(varRef2.equals(varRef1));
	});

	it('it returns false if compared with a Literal with unequal type', () => {
		const varRef1 = new Literal(1, 'xs:integer'),
			varRef2 = new Literal(1, 'xs:double');
		chai.assert.isFalse(varRef1.equals(varRef2));
		chai.assert.isFalse(varRef2.equals(varRef1));
	});

	it('it returns false if compared with a Literal with unequal value', () => {
		const varRef1 = new Literal(1, 'xs:integer'),
			varRef2 = new Literal(2, 'xs:integer');
		chai.assert.isFalse(varRef1.equals(varRef2));
		chai.assert.isFalse(varRef2.equals(varRef1));
	});
});
