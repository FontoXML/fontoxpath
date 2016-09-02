define([
	'fontoxml-selectors/selectors/Specificity',
	'fontoxml-selectors/selectors/axes/AncestorAxis'
], function (
	Specificity,
	AncestorAxis
) {
	'use strict';

	describe('AncestorAxis.equals()', function () {
		it('returns true if compared with itself', function () {
			var ancestor1 = new AncestorAxis({
					specificity: new Specificity({}),
					equals: sinon.stub().returns(true)
				}),
				ancestor2 = ancestor1;

			var result1 = ancestor1.equals(ancestor2),
				result2 = ancestor2.equals(ancestor1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('returns true if compared with an equal other AncestorAxis', function () {
			var ancestor1 = new AncestorAxis({
					specificity: new Specificity({}),
					equals: sinon.stub().returns(true)
				}),
				ancestor2 = new AncestorAxis({
					specificity: new Specificity({}),
					equals: sinon.stub().returns(true)
				});

			var result1 = ancestor1.equals(ancestor2),
				result2 = ancestor2.equals(ancestor1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('returns false if compared with an AncestorAxis unequal on selector', function () {
			var ancestor1 = new AncestorAxis({
					specificity: new Specificity({}),
					equals: sinon.stub().returns(false)
				}),
				ancestor2 = new AncestorAxis({
					specificity: new Specificity({}),
					equals: sinon.stub().returns(false)
				});

			var result1 = ancestor1.equals(ancestor2),
				result2 = ancestor2.equals(ancestor1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});

		it('returns false if compared with an AncestorAxis unequal on inclusiveness', function () {
			var ancestor1 = new AncestorAxis({
					specificity: new Specificity({}),
					equals: sinon.stub().returns(true)
				}, {inclusive: false}),
				ancestor2 = new AncestorAxis({
					specificity: new Specificity({}),
					equals: sinon.stub().returns(true)
				}, {inclusive: true});

			var result1 = ancestor1.equals(ancestor2),
				result2 = ancestor2.equals(ancestor1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});
	});
});
