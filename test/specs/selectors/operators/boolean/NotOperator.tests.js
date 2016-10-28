import Specificity from 'fontoxml-selectors/selectors/Specificity';
import NotOperator from 'fontoxml-selectors/selectors/operators/boolean/NotOperator';

const equalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(true)
	},
	unequalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(false)
	};

describe('NotOperator.equals()', () => {
	it('is equal if compared with itself', () => {
		const not1 = new NotOperator(equalSelector),
			not2 = not1;
		chai.expect(not1.equals(not2)).to.equal(true);
		chai.expect(not2.equals(not1)).to.equal(true);
	});

	it('is equal if compared with an equal other NotOperator', () => {
		const not1 = new NotOperator(equalSelector),
			not2 = new NotOperator(equalSelector);
		chai.expect(not1.equals(not2)).to.equal(true);
		chai.expect(not2.equals(not1)).to.equal(true);
	});
});
