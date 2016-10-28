import Literal from 'fontoxml-selectors/selectors/literals/Literal';

describe('Literal.equals()', () => {
	it('returns true if compared with itself', () => {
		const varRef1 = new Literal(1, 'xs:integer'),
			varRef2 = varRef1;

		const result1 = varRef1.equals(varRef2),
			result2 = varRef2.equals(varRef1);

		chai.expect(result1).to.equal(true);
		chai.expect(result2).to.equal(true);
	});

	it('it returns true if compared with an equal other Literal', () => {
		const varRef1 = new Literal(1, 'xs:integer'),
			varRef2 = new Literal(1, 'xs:integer');

		const result1 = varRef1.equals(varRef2),
			result2 = varRef2.equals(varRef1);

		chai.expect(result1).to.equal(true);
		chai.expect(result2).to.equal(true);
	});

	it('it returns false if compared with an unequal other Literal', () => {
		const varRef1 = new Literal(1, 'xs:integer'),
			varRef2 = new Literal(2, 'xs:integer');

		const result1 = varRef1.equals(varRef2),
			result2 = varRef2.equals(varRef1);

		chai.expect(result1).to.equal(false);
		chai.expect(result2).to.equal(false);
	});

	it('it returns false if compared with a Literal with unequal type', () => {
		const varRef1 = new Literal(1, 'xs:integer'),
			varRef2 = new Literal(1, 'xs:double');

		const result1 = varRef1.equals(varRef2),
			result2 = varRef2.equals(varRef1);

		chai.expect(result1).to.equal(false);
		chai.expect(result2).to.equal(false);
	});

	it('it returns false if compared with a Literal with unequal value', () => {
		const varRef1 = new Literal(1, 'xs:integer'),
			varRef2 = new Literal(2, 'xs:integer');

		const result1 = varRef1.equals(varRef2),
			result2 = varRef2.equals(varRef1);

		chai.expect(result1).to.equal(false);
		chai.expect(result2).to.equal(false);
	});
});
