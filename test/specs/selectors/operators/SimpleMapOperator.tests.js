import SimpleMapOperator from 'fontoxpath/selectors/operators/SimpleMapOperator';
import Specificity from 'fontoxpath/selectors/Specificity';

const equalSelector = {
		equals: sinon.stub().returns(true),
		specificity: new Specificity({})
	},
	unequalSelector = {
		equals: sinon.stub().returns(false),
		specificity: new Specificity({})
	};

describe('SimpleMapOperator.equals()', () => {
	it('returns true if compared with itself', () => {
		const instanceOfOperator1 = new SimpleMapOperator(equalSelector, equalSelector),
			instanceOfOperator2 = instanceOfOperator1;
		chai.expect(instanceOfOperator1.equals(instanceOfOperator2)).to.equal(true);
		chai.expect(instanceOfOperator2.equals(instanceOfOperator1)).to.equal(true);
	});

	it('returns true if compared with an equal other SimpleMapOperator', () => {
		const instanceOfOperator1 = new SimpleMapOperator(equalSelector, equalSelector),
			instanceOfOperator2 = new SimpleMapOperator(equalSelector, equalSelector);
		chai.expect(instanceOfOperator1.equals(instanceOfOperator2)).to.equal(true);
		chai.expect(instanceOfOperator2.equals(instanceOfOperator1)).to.equal(true);
	});

	it('returns false if compared with a SimpleMapOperator unqual for the first sub selector', () => {
		const instanceOfOperator1 = new SimpleMapOperator(unequalSelector, equalSelector),
			instanceOfOperator2 = new SimpleMapOperator(unequalSelector, equalSelector);
		chai.expect(instanceOfOperator1.equals(instanceOfOperator2)).to.equal(false);
		chai.expect(instanceOfOperator2.equals(instanceOfOperator1)).to.equal(false);
	});

	it('returns false if compared with a SimpleMapOperator unqual for the first sub selector', () => {
		const instanceOfOperator1 = new SimpleMapOperator(equalSelector, unequalSelector),
			instanceOfOperator2 = new SimpleMapOperator(equalSelector, unequalSelector);
		chai.expect(instanceOfOperator1.equals(instanceOfOperator2)).to.equal(false);
		chai.expect(instanceOfOperator2.equals(instanceOfOperator1)).to.equal(false);
	});

	it('returns false if compared with an unqual other SimpleMapOperator', () => {
		const instanceOfOperator1 = new SimpleMapOperator(unequalSelector, unequalSelector),
			instanceOfOperator2 = new SimpleMapOperator(unequalSelector, unequalSelector);
		chai.expect(instanceOfOperator1.equals(instanceOfOperator2)).to.equal(false);
		chai.expect(instanceOfOperator2.equals(instanceOfOperator1)).to.equal(false);
	});
});
