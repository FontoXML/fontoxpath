import Specificity from 'fontoxml-selectors/selectors/Specificity';
import SequenceOperator from 'fontoxml-selectors/selectors/operators/SequenceOperator';

const equalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(true)
	},
	unequalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(false)
	};

describe('SequenceOperator.equals()', () => {
	it('returns true if compared with itself', () => {
		const sequenceOperator1 = new SequenceOperator([equalSelector]),
			sequenceOperator2 = sequenceOperator1;
		chai.expect(sequenceOperator1.equals(sequenceOperator2)).to.equal(true);
		chai.expect(sequenceOperator2.equals(sequenceOperator1)).to.equal(true);
	});

	it('returns true if compared with an equal other SequenceOperator', () => {
		const sequenceOperator1 = new SequenceOperator([equalSelector, equalSelector]),
			sequenceOperator2 = new SequenceOperator([equalSelector, equalSelector]);
		chai.expect(sequenceOperator1.equals(sequenceOperator2)).to.equal(true);
		chai.expect(sequenceOperator2.equals(sequenceOperator1)).to.equal(true);
	});

	it('returns false if compared with an SequenceOperator unequal on the first selector', () => {
		const sequenceOperator1 = new SequenceOperator([unequalSelector, equalSelector]),
			sequenceOperator2 = new SequenceOperator([unequalSelector, equalSelector]);
		chai.expect(sequenceOperator1.equals(sequenceOperator2)).to.equal(false);
		chai.expect(sequenceOperator2.equals(sequenceOperator1)).to.equal(false);
	});

	it('returns false if compared with an SequenceOperator unequal on the second selector', () => {
		const sequenceOperator1 = new SequenceOperator([equalSelector, unequalSelector]),
			sequenceOperator2 = new SequenceOperator([equalSelector, unequalSelector]);
		chai.expect(sequenceOperator1.equals(sequenceOperator2)).to.equal(false);
		chai.expect(sequenceOperator2.equals(sequenceOperator1)).to.equal(false);
	});
});
