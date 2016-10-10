define([
	'fontoxml-selectors/selectors/Specificity',
	'fontoxml-selectors/selectors/axes/AncestorAxis'
], function (
	Specificity,
	AncestorAxis
) {
	'use strict';

	var equalSelector = {
			specificity: new Specificity({}),
			equals: sinon.stub().returns(true)
		},
		unequalSelector = {
			specificity: new Specificity({}),
			equals: sinon.stub().returns(false)
		};

	describe('AncestorAxis.equals()', function () {
		it('returns true if compared with itself', function () {
			var ancestor1 = new AncestorAxis(equalSelector),
				ancestor2 = ancestor1;

			var result1 = ancestor1.equals(ancestor2),
				result2 = ancestor2.equals(ancestor1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('returns true if compared with an equal other AncestorAxis', function () {
			var ancestor1 = new AncestorAxis(equalSelector),
				ancestor2 = new AncestorAxis(equalSelector);

			var result1 = ancestor1.equals(ancestor2),
				result2 = ancestor2.equals(ancestor1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('returns false if compared with an unequal other AncestorAxis', function () {
			var ancestor1 = new AncestorAxis(unequalSelector),
				ancestor2 = new AncestorAxis(unequalSelector);

			var result1 = ancestor1.equals(ancestor2),
				result2 = ancestor2.equals(ancestor1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});

		it('returns false if compared with an AncestorAxis unequal on inclusiveness', function () {
			var ancestor1 = new AncestorAxis(equalSelector, {inclusive: false}),
				ancestor2 = new AncestorAxis(equalSelector, {inclusive: true});

			var result1 = ancestor1.equals(ancestor2),
				result2 = ancestor2.equals(ancestor1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});
	});
});
