define([
	'fontoxml-selectors/selectors/Specificity',
	'fontoxml-selectors/selectors/axes/SelfAxis'
], function (
	Specificity,
	SelfAxis
) {
	'use strict';

	describe('SelfAxis.equals()', function () {
		it('returns true if compared with itself', function () {
			var self1 = new SelfAxis({
					specificity: new Specificity({}),
					equals: sinon.stub().returns(true)
				}),
				self2 = self1;

			var result1 = self1.equals(self2),
				result2 = self2.equals(self1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('returns true if compared with an equal other SelfAxis', function () {
			var self1 = new SelfAxis({
					specificity: new Specificity({}),
					equals: sinon.stub().returns(true)
				}),
				self2 = new SelfAxis({
					specificity: new Specificity({}),
					equals: sinon.stub().returns(true)
				});

			var result1 = self1.equals(self2),
				result2 = self2.equals(self1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('returns false if compared with an unequal other SelfAxis', function () {
			var self1 = new SelfAxis({
					specificity: new Specificity({}),
					equals: sinon.stub().returns(false)
				}),
				self2 = new SelfAxis({
					specificity: new Specificity({}),
					equals: sinon.stub().returns(false)
				});

			var result1 = self1.equals(self2),
				result2 = self2.equals(self1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});
	});
});
