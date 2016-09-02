define([
	'fontoxml-selectors/selectors/literals/Literal'
], function (
	Literal
	) {
	'use strict';

	describe('Literal.equals()', function () {
		it('returns true if compared with itself', function () {
			var varRef1 = new Literal(1, 'xs:integer'),
				varRef2 = varRef1;

			var result1 = varRef1.equals(varRef2),
				result2 = varRef2.equals(varRef1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('it returns true if compared with an equal other Literal', function () {
			var varRef1 = new Literal(1, 'xs:integer'),
				varRef2 = new Literal(1, 'xs:integer');

			var result1 = varRef1.equals(varRef2),
				result2 = varRef2.equals(varRef1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('it returns false if compared with an unequal other Literal', function () {
			var varRef1 = new Literal(1, 'xs:integer'),
				varRef2 = new Literal(2, 'xs:integer');

			var result1 = varRef1.equals(varRef2),
				result2 = varRef2.equals(varRef1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});

		it('it returns false if compared with a Literal with unequal type', function () {
			var varRef1 = new Literal(1, 'xs:integer'),
				varRef2 = new Literal(1, 'xs:double');

			var result1 = varRef1.equals(varRef2),
				result2 = varRef2.equals(varRef1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});

		it('it returns false if compared with a Literal with unequal value', function () {
			var varRef1 = new Literal(1, 'xs:integer'),
				varRef2 = new Literal(2, 'xs:integer');

			var result1 = varRef1.equals(varRef2),
				result2 = varRef2.equals(varRef1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});
	});
});
