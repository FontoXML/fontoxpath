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
		chai.expect(unary1.equals(unary2)).to.equal(true);
		chai.expect(unary2.equals(unary1)).to.equal(true);
	});

	it('it returns true if compared with an equal other Unary', () => {
		const unary1 = new Unary('+', equalSelector),
			unary2 = new Unary('+', equalSelector);
		chai.expect(unary1.equals(unary2)).to.equal(true);
		chai.expect(unary2.equals(unary1)).to.equal(true);
	});

	it('it returns false if compared with an unequal other Unary', () => {
		const unary1 = new Unary('+', unequalSelector),
			unary2 = new Unary('-', unequalSelector);
		chai.expect(unary1.equals(unary2)).to.equal(false);
		chai.expect(unary2.equals(unary1)).to.equal(false);
	});
});
