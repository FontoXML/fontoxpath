import PathSelector from 'fontoxpath/selectors/path/PathSelector';
import Specificity from 'fontoxpath/selectors/Specificity';

const equalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(true)
	},
	unequalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(false)
	};

describe('PathSelector.equals()', () => {
	it('returns true if compared with itself', () => {
		const pathSelector1 = new PathSelector([equalSelector, equalSelector]),
			pathSelector2 = pathSelector1;
		chai.assert.isTrue(pathSelector1.equals(pathSelector2));
		chai.assert.isTrue(pathSelector2.equals(pathSelector1));
	});

	it('it returns true if compared with an equal other PathSelector', () => {
		const pathSelector1 = new PathSelector([equalSelector, equalSelector]),
			pathSelector2 = new PathSelector([equalSelector, equalSelector]);
		chai.assert.isTrue(pathSelector1.equals(pathSelector2));
		chai.assert.isTrue(pathSelector2.equals(pathSelector1));
	});

	it('it returns false if compared with a PathSelector unequal for the first subSelector', () => {
		const pathSelector1 = new PathSelector([equalSelector, unequalSelector]),
			pathSelector2 = new PathSelector([equalSelector, unequalSelector]);
		chai.assert.isFalse(pathSelector1.equals(pathSelector2));
		chai.assert.isFalse(pathSelector2.equals(pathSelector1));
	});

	it('it returns false if compared with a PathSelector unequal for the first subSelector', () => {
		const pathSelector1 = new PathSelector([unequalSelector, equalSelector]),
			pathSelector2 = new PathSelector([unequalSelector, equalSelector]);
		chai.assert.isFalse(pathSelector1.equals(pathSelector2));
		chai.assert.isFalse(pathSelector2.equals(pathSelector1));
	});

	it('it returns false if compared with an unequal other PathSelector', () => {
		const pathSelector1 = new PathSelector([unequalSelector, unequalSelector]),
			pathSelector2 = new PathSelector([unequalSelector, unequalSelector]);
		chai.assert.isFalse(pathSelector1.equals(pathSelector2));
		chai.assert.isFalse(pathSelector2.equals(pathSelector1));
	});
});
