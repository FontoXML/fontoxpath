import AttributeAxis from 'fontoxpath/selectors/axes/AttributeAxis';

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
		chai.assert.isTrue(attribute1.equals(attribute2));
		chai.assert.isTrue(attribute2.equals(attribute1));
	});

	it('returns true if compared with an equal other AttributeAxis', () => {
		const attribute1 = new AttributeAxis(equalSelector),
			attribute2 = new AttributeAxis(equalSelector);
		chai.assert.isTrue(attribute1.equals(attribute2));
		chai.assert.isTrue(attribute2.equals(attribute1));
	});

	it('returns false if compared with an unequal other AttributeAxis', () => {
		const attribute1 = new AttributeAxis(unequalSelector),
			attribute2 = new AttributeAxis(unequalSelector);
		chai.assert.isFalse(attribute1.equals(attribute2));
		chai.assert.isFalse(attribute2.equals(attribute1));
	});
});
