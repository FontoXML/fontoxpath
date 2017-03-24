import AbsolutePathSelector from 'fontoxpath/selectors/path/AbsolutePathSelector';
import Specificity from 'fontoxpath/selectors/Specificity';

const equalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(true)
	},
	unequalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(false)
	};

describe('AbsolutePathSelector.equals()', () => {
	it('returns true if compared with itself', () => {
		const absolutePathSelector1 = new AbsolutePathSelector(equalSelector),
			absolutePathSelector2 = absolutePathSelector1;
		chai.assert.isTrue(absolutePathSelector1.equals(absolutePathSelector2));
		chai.assert.isTrue(absolutePathSelector2.equals(absolutePathSelector1));
	});

	it('it returns true if compared with an equal other AbsolutePathSelector', () => {
		const absolutePathSelector1 = new AbsolutePathSelector(equalSelector),
			absolutePathSelector2 = new AbsolutePathSelector(equalSelector);
		chai.assert.isTrue(absolutePathSelector1.equals(absolutePathSelector2));
		chai.assert.isTrue(absolutePathSelector2.equals(absolutePathSelector1));
	});

	it('it returns false if compared with an unequal other AbsolutePathSelector', () => {
		const absolutePathSelector1 = new AbsolutePathSelector(unequalSelector),
			absolutePathSelector2 = new AbsolutePathSelector(unequalSelector);
		chai.assert.isFalse(absolutePathSelector1.equals(absolutePathSelector2));
		chai.assert.isFalse(absolutePathSelector2.equals(absolutePathSelector1));
	});
});
