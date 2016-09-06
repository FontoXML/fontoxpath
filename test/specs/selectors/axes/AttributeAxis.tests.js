define([
	'fontoxml-selectors/selectors/Specificity',
	'fontoxml-selectors/selectors/axes/AttributeAxis'
], function (
	Specificity,
	AttributeAxis
) {
	'use strict';

	describe('AttributeAxis.equals()', function () {
		it('returns true if compared with itself', function () {
			var attribute1 = new AttributeAxis({ equals: sinon.stub().returns(true) }),
				attribute2 = attribute1;

			var result1 = attribute1.equals(attribute2),
				result2 = attribute2.equals(attribute1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('returns true if compared with an equal other AttributeAxis', function () {
			var attribute1 = new AttributeAxis({ equals: sinon.stub().returns(true) }),
				attribute2 = new AttributeAxis({ equals: sinon.stub().returns(true) });

			var result1 = attribute1.equals(attribute2),
				result2 = attribute2.equals(attribute1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('returns false if compared with an unequal other AttributeAxis', function () {
			var attribute1 = new AttributeAxis({ equals: sinon.stub().returns(false) }),
				attribute2 = new AttributeAxis({ equals: sinon.stub().returns(false) });

			var result1 = attribute1.equals(attribute2),
				result2 = attribute2.equals(attribute1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});
	});
});
