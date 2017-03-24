import Specificity from 'fontoxpath/selectors/Specificity';
import OrOperator from 'fontoxpath/selectors/operators/boolean/OrOperator';

const equalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(true),
		getBucket: sinon.stub().returns(null)
	},
	unequalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(false),
		getBucket: sinon.stub().returns(null)
	};

describe('OrOperator.equals()', () => {
	it('returns true if compared with itself', () => {
		const or1 = new OrOperator([equalSelector, equalSelector]),
			or2 = or1;
		chai.assert.isTrue(or1.equals(or2));
		chai.assert.isTrue(or2.equals(or1));
	});

	it('it returns true if compared with an equal other OrOperator', () => {
		const or1 = new OrOperator([equalSelector, equalSelector]),
			or2 = new OrOperator([equalSelector, equalSelector]);
		chai.assert.isTrue(or1.equals(or2));
		chai.assert.isTrue(or2.equals(or1));
	});

	it('it returns false if compared with an unequal other OrOperator', () => {
		const or1 = new OrOperator([equalSelector, unequalSelector]),
			or2 = new OrOperator([unequalSelector, equalSelector]);
		chai.assert.isFalse(or1.equals(or2));
		chai.assert.isFalse(or2.equals(or1));
	});
});
