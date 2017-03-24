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
		chai.assert.isTrue(compare1.equals(compare2));
		chai.assert.isTrue(compare2.equals(compare1));
	});

	it('it returns true if compared with an equal other Compare', () => {
		const compare1 = new Compare(['generalCompare', 'eq'], equalSelector, equalSelector),
			compare2 = new Compare(['generalCompare', 'eq'], equalSelector, equalSelector);
		chai.assert.isTrue(compare1.equals(compare2));
		chai.assert.isTrue(compare2.equals(compare1));
	});

	it('it returns false if compared with a Compare unequal on the first part', () => {
		const compare1 = new Compare(['generalCompare', 'eq'], unequalSelector, equalSelector),
			compare2 = new Compare(['generalCompare', 'eq'], unequalSelector, equalSelector);
		chai.assert.isFalse(compare1.equals(compare2));
		chai.assert.isFalse(compare2.equals(compare1));
	});

	it('it returns false if compared with a Compare unequal on the second part', () => {
		const compare1 = new Compare(['generalCompare', 'eq'], equalSelector, unequalSelector),
			compare2 = new Compare(['generalCompare', 'eq'], equalSelector, unequalSelector);
		chai.assert.isFalse(compare1.equals(compare2));
		chai.assert.isFalse(compare2.equals(compare1));
	});

	it('it returns false if compared with an unequal other Compare', () => {
		const compare1 = new Compare(['generalCompare', 'eq'], unequalSelector, unequalSelector),
			compare2 = new Compare(['generalCompare', 'eq'], unequalSelector, unequalSelector);
		chai.assert.isFalse(compare1.equals(compare2));
		chai.assert.isFalse(compare2.equals(compare1));
	});
});
