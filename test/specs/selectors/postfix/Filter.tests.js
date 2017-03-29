import Filter from 'fontoxpath/selectors/postfix/Filter';
import Specificity from 'fontoxpath/selectors/Specificity';

const equalSelector = {
			specificity: new Specificity({}),
			equals: sinon.stub().returns(true)
		},
	unequalSelector = {
			specificity: new Specificity({}),
			equals: sinon.stub().returns(false)
		};

describe('Filter.getBucket()', () => {
	it('returns the bucket of its selector', () => {
		const filter = new Filter({ getBucket: () => 'bucket', specificity: new Specificity({}) }, equalSelector);
		chai.assert.equal(filter.getBucket(), 'bucket');
	});
});

describe('Filter.specificity', () => {
	it('returns the specificity of the selector plus the other part', () => {
		const filter = new Filter({ specificity: new Specificity({ external: 1 }) }, { specificity: new Specificity({ external: 1 }) });
		chai.assert.equal(filter.specificity.compareTo(new Specificity({ external: 2 })), 0, 'should be of equal specificity');
	});
});
