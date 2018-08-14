import Filter from 'fontoxpath/expressions/postfix/Filter';
import Specificity from 'fontoxpath/expressions/Specificity';

const equalExpression = {
			specificity: new Specificity({}),
			equals: sinon.stub().returns(true)
		},
	unequalExpression = {
			specificity: new Specificity({}),
			equals: sinon.stub().returns(false)
		};

describe('Filter.getBucket()', () => {
	it('returns the bucket of its selector', () => {
		const filter = new Filter({ getBucket: () => 'bucket', specificity: new Specificity({}) }, equalExpression);
		chai.assert.equal(filter.getBucket(), 'bucket');
	});
});

describe('Filter.specificity', () => {
	it('returns the specificity of the selector plus the other part', () => {
		const filter = new Filter({ specificity: new Specificity({ external: 1 }) }, { specificity: new Specificity({ external: 1 }) });
		chai.assert.equal(filter.specificity.compareTo(new Specificity({ external: 2 })), 0, 'should be of equal specificity');
	});
});
