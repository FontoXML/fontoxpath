import AttributeAxis from 'fontoxml-selectors/selectors/axes/AttributeAxis';

const equalSelector = {
		equals: sinon.stub().returns(true)
	},
	unequalSelector = {
		equals: sinon.stub().returns(false)
	};

describe('AttributeAxis.equals()', () => {
	it('returns true if compared with itself', () => {
		const attribute1 = new AttributeAxis(equalSelector),
			attribute2 = attribute1;

		const result1 = attribute1.equals(attribute2),
			result2 = attribute2.equals(attribute1);

		chai.expect(result1).to.equal(true);
		chai.expect(result2).to.equal(true);
	});

	it('returns true if compared with an equal other AttributeAxis', () => {
		const attribute1 = new AttributeAxis(equalSelector),
			attribute2 = new AttributeAxis(equalSelector);

		const result1 = attribute1.equals(attribute2),
			result2 = attribute2.equals(attribute1);

		chai.expect(result1).to.equal(true);
		chai.expect(result2).to.equal(true);
	});

	it('returns false if compared with an unequal other AttributeAxis', () => {
		const attribute1 = new AttributeAxis(unequalSelector),
			attribute2 = new AttributeAxis(unequalSelector);

		const result1 = attribute1.equals(attribute2),
			result2 = attribute2.equals(attribute1);

		chai.expect(result1).to.equal(false);
		chai.expect(result2).to.equal(false);
	});
});
