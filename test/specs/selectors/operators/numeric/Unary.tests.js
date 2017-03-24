import Unary from 'fontoxpath/selectors/operators/numeric/Unary';
import Specificity from 'fontoxpath/selectors/Specificity';

const equalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(true)
	},
	unequalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(false)
	};

describe('Unary.equals()', () => {
	it('returns true if compared with itself', () => {
		const unary1 = new Unary('+', equalSelector),
			unary2 = unary1;
		chai.assert.isTrue(unary1.equals(unary2));
		chai.assert.isTrue(unary2.equals(unary1));
	});

	it('it returns true if compared with an equal other Unary', () => {
		const unary1 = new Unary('+', equalSelector),
			unary2 = new Unary('+', equalSelector);
		chai.assert.isTrue(unary1.equals(unary2));
		chai.assert.isTrue(unary2.equals(unary1));
	});

	it('it returns false if compared with an unequal other Unary', () => {
		const unary1 = new Unary('+', unequalSelector),
			unary2 = new Unary('-', unequalSelector);
		chai.assert.isFalse(unary1.equals(unary2));
		chai.assert.isFalse(unary2.equals(unary1));
	});
});
