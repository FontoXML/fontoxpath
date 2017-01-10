import Specificity from 'fontoxpath/selectors/Specificity';
import AndOperator from 'fontoxpath/selectors/operators/boolean/AndOperator';

const equalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(true)
	},
	unequalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(false)
	};

describe('AndOperator.equals()', () => {
	it('returns true if compared with itself', () => {
		const and1 = new AndOperator([equalSelector]),
			and2 = and1;
		chai.expect(and1.equals(and2)).to.equal(true);
		chai.expect(and2.equals(and1)).to.equal(true);
	});

	it('returns true if compared with an equal other AndOperator', () => {
		const and1 = new AndOperator([equalSelector, equalSelector]),
			and2 = new AndOperator([equalSelector, equalSelector]);
		chai.expect(and1.equals(and2)).to.equal(true);
		chai.expect(and2.equals(and1)).to.equal(true);
	});

	it('returns false if compared with an AndOperator unequal on the first selector', () => {
		const and1 = new AndOperator([unequalSelector, equalSelector]),
			and2 = new AndOperator([unequalSelector, equalSelector]);
		chai.expect(and1.equals(and2)).to.equal(false);
		chai.expect(and2.equals(and1)).to.equal(false);
	});

	it('returns false if compared with an AndOperator unequal on the second selector', () => {
		const and1 = new AndOperator([equalSelector, unequalSelector]),
			and2 = new AndOperator([equalSelector, unequalSelector]);
		chai.expect(and1.equals(and2)).to.equal(false);
		chai.expect(and2.equals(and1)).to.equal(false);
	});
});
