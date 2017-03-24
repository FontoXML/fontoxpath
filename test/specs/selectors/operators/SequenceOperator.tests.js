import Specificity from 'fontoxpath/selectors/Specificity';
import SequenceOperator from 'fontoxpath/selectors/operators/SequenceOperator';

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
		chai.assert.isTrue(sequenceOperator1.equals(sequenceOperator2));
		chai.assert.isTrue(sequenceOperator2.equals(sequenceOperator1));
	});

	it('returns true if compared with an equal other SequenceOperator', () => {
		const sequenceOperator1 = new SequenceOperator([equalSelector, equalSelector]),
			sequenceOperator2 = new SequenceOperator([equalSelector, equalSelector]);
		chai.assert.isTrue(sequenceOperator1.equals(sequenceOperator2));
		chai.assert.isTrue(sequenceOperator2.equals(sequenceOperator1));
	});

	it('returns false if compared with an SequenceOperator unequal on the first selector', () => {
		const sequenceOperator1 = new SequenceOperator([unequalSelector, equalSelector]),
			sequenceOperator2 = new SequenceOperator([unequalSelector, equalSelector]);
		chai.assert.isFalse(sequenceOperator1.equals(sequenceOperator2));
		chai.assert.isFalse(sequenceOperator2.equals(sequenceOperator1));
	});

	it('returns false if compared with an SequenceOperator unequal on the second selector', () => {
		const sequenceOperator1 = new SequenceOperator([equalSelector, unequalSelector]),
			sequenceOperator2 = new SequenceOperator([equalSelector, unequalSelector]);
		chai.assert.isFalse(sequenceOperator1.equals(sequenceOperator2));
		chai.assert.isFalse(sequenceOperator2.equals(sequenceOperator1));
	});
});
