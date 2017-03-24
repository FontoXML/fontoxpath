import Specificity from 'fontoxpath/selectors/Specificity';
import Union from 'fontoxpath/selectors/operators/Union';

const equalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(true)
	},
	unequalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(false)
	};

describe('Union.equals()', () => {
	it('returns true if compared with itself', () => {
		const unionOperator1 = new Union([equalSelector, equalSelector]),
			unionOperator2 = unionOperator1;
		chai.assert.isTrue(unionOperator1.equals(unionOperator2));
		chai.assert.isTrue(unionOperator2.equals(unionOperator1));
	});

	it('it returns true if compared with an equal other Union', () => {
		const unionOperator1 = new Union([equalSelector, equalSelector]),
			unionOperator2 = new Union([equalSelector, equalSelector]);
		chai.assert.isTrue(unionOperator1.equals(unionOperator2));
		chai.assert.isTrue(unionOperator2.equals(unionOperator1));
	});

	it('it returns false if compared with a Union unequal for the first subSelector', () => {
		const unionOperator1 = new Union([equalSelector, unequalSelector]),
			unionOperator2 = new Union([equalSelector, unequalSelector]);
		chai.assert.isFalse(unionOperator1.equals(unionOperator2));
		chai.assert.isFalse(unionOperator2.equals(unionOperator1));
	});

	it('it returns false if compared with a Union unequal for the first subSelector', () => {
		const unionOperator1 = new Union([unequalSelector, equalSelector]),
			unionOperator2 = new Union([unequalSelector, equalSelector]);
		chai.assert.isFalse(unionOperator1.equals(unionOperator2));
		chai.assert.isFalse(unionOperator2.equals(unionOperator1));
	});

	it('it returns false if compared with an unequal other Union', () => {
		const unionOperator1 = new Union([unequalSelector, unequalSelector]),
			unionOperator2 = new Union([unequalSelector, unequalSelector]);
		chai.assert.isFalse(unionOperator1.equals(unionOperator2));
		chai.assert.isFalse(unionOperator2.equals(unionOperator1));
	});
});
