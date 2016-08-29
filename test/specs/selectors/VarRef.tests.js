define([
	'fontoxml-selectors/selectors/VarRef'
], function (
	VarRef
	) {
	'use strict';

	describe('VarRef.equals()', function () {
		it('returns true if compared with itself', function () {
			var varRef1 = new VarRef('value'),
				varRef2 = varRef1;

			var result1 = varRef1.equals(varRef2),
				result2 = varRef2.equals(varRef1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('it returns true if compared with an equal other VarRef', function () {
			var varRef1 = new VarRef('value'),
				varRef2 = new VarRef('value');

			var result1 = varRef1.equals(varRef2),
				result2 = varRef2.equals(varRef1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('it returns false if compared with an unequal other VarRef', function () {
			var varRef1 = new VarRef('value1'),
				varRef2 = new VarRef('value2');

			var result1 = varRef1.equals(varRef2),
				result2 = varRef2.equals(varRef1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});
	});

});
