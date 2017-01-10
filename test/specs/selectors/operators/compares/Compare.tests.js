import Compare from 'fontoxpath/selectors/operators/compares/Compare';
import Specificity from 'fontoxpath/selectors/Specificity';

const equalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(true)
	},
	unequalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(false)
	};

describe('Compare.equals()', () => {
	it('returns true if compared with itself', () => {
		const compare1 = new Compare(['generalCompare', 'eq'], equalSelector, equalSelector),
			compare2 = compare1;
		chai.expect(compare1.equals(compare2)).to.equal(true);
		chai.expect(compare2.equals(compare1)).to.equal(true);
	});

	it('it returns true if compared with an equal other Compare', () => {
		const compare1 = new Compare(['generalCompare', 'eq'], equalSelector, equalSelector),
			compare2 = new Compare(['generalCompare', 'eq'], equalSelector, equalSelector);
		chai.expect(compare1.equals(compare2)).to.equal(true);
		chai.expect(compare2.equals(compare1)).to.equal(true);
	});

	it('it returns false if compared with a Compare unequal on the first part', () => {
		const compare1 = new Compare(['generalCompare', 'eq'], unequalSelector, equalSelector),
			compare2 = new Compare(['generalCompare', 'eq'], unequalSelector, equalSelector);
		chai.expect(compare1.equals(compare2)).to.equal(false);
		chai.expect(compare2.equals(compare1)).to.equal(false);
	});

	it('it returns false if compared with a Compare unequal on the second part', () => {
		const compare1 = new Compare(['generalCompare', 'eq'], equalSelector, unequalSelector),
			compare2 = new Compare(['generalCompare', 'eq'], equalSelector, unequalSelector);
		chai.expect(compare1.equals(compare2)).to.equal(false);
		chai.expect(compare2.equals(compare1)).to.equal(false);
	});

	it('it returns false if compared with an unequal other Compare', () => {
		const compare1 = new Compare(['generalCompare', 'eq'], unequalSelector, unequalSelector),
			compare2 = new Compare(['generalCompare', 'eq'], unequalSelector, unequalSelector);
		chai.expect(compare1.equals(compare2)).to.equal(false);
		chai.expect(compare2.equals(compare1)).to.equal(false);
	});
});
