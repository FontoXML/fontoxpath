define([
	'fontoxml-selectors/selectors/axes/AttributeAxis'
], function (
	AttributeAxis
) {
	'use strict';

	var equalSelector = {
			equals: sinon.stub().returns(true)
		},
		unequalSelector = {
			equals: sinon.stub().returns(false)
		};

	describe('AttributeAxis.equals()', function () {
		it('returns true if compared with itself', function () {
			var attribute1 = new AttributeAxis(equalSelector),
				attribute2 = attribute1;

			var result1 = attribute1.equals(attribute2),
				result2 = attribute2.equals(attribute1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('returns true if compared with an equal other AttributeAxis', function () {
			var attribute1 = new AttributeAxis(equalSelector),
				attribute2 = new AttributeAxis(equalSelector);

			var result1 = attribute1.equals(attribute2),
				result2 = attribute2.equals(attribute1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('returns false if compared with an unequal other AttributeAxis', function () {
			var attribute1 = new AttributeAxis(unequalSelector),
				attribute2 = new AttributeAxis(unequalSelector);

			var result1 = attribute1.equals(attribute2),
				result2 = attribute2.equals(attribute1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});
	});
});
