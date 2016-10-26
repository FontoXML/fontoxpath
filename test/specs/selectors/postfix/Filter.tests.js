import Filter from 'fontoxml-selectors/selectors/postfix/Filter';
import Specificity from 'fontoxml-selectors/selectors/Specificity';

const equalSelector = {
			specificity: new Specificity({}),
			equals: sinon.stub().returns(true)
		},
	unequalSelector = {
			specificity: new Specificity({}),
			equals: sinon.stub().returns(false)
		};

describe('Filter.equals()', () => {
	it('returns true if compared with itself', () => {
		var filter1 = new Filter(equalSelector, equalSelector),
			filter2 = filter1;
		chai.assert.isTrue(filter1.equals(filter2));
		chai.assert.isTrue(filter2.equals(filter1));
	});

	it('it returns true if compared with an equal other Filter', () => {
		var filter1 = new Filter(equalSelector, equalSelector),
			filter2 = new Filter(equalSelector, equalSelector);
		chai.assert.isTrue(filter1.equals(filter2));
		chai.assert.isTrue(filter2.equals(filter1));
	});

	it('it returns false if compared with a unequal other Filter (unequal selector)', () => {
		var filter1 = new Filter(unequalSelector, equalSelector),
			filter2 = new Filter(unequalSelector, equalSelector);
		chai.assert.isFalse(filter1.equals(filter2));
		chai.assert.isFalse(filter2.equals(filter1));
	});

	it('it returns false if compared with a unequal other Filter (unequal filterSelector)', () => {
		var filter1 = new Filter(equalSelector, unequalSelector),
			filter2 = new Filter(equalSelector, unequalSelector);
		chai.assert.isFalse(filter1.equals(filter2));
		chai.assert.isFalse(filter2.equals(filter1));
	});
});

describe('Filter.getBucket()', () => {
	it('returns the bucket of its selector', () => {
		var filter = new Filter({ getBucket: () => { return 'bucket'; }});
		chai.assert.equal(filter.getBucket(), 'bucket');
	});
});
