import LetExpression from 'fontoxpath/selectors/LetExpression';
import Specificity from 'fontoxpath/selectors/Specificity';

const equalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(true)
	},
	unequalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(false)
	};

describe('LetExpression.equals()', () => {
	it('returns true if compared with itself', () => {
		const letExpression1 = new LetExpression('value', equalSelector, equalSelector),
			letExpression2 = letExpression1;
		chai.expect(letExpression1.equals(letExpression2)).to.equal(true);
		chai.expect(letExpression2.equals(letExpression1)).to.equal(true);
	});

	it('it returns true if compared with an equal other LetExpression', () => {
		const letExpression1 = new LetExpression('value', equalSelector, equalSelector),
			letExpression2 = new LetExpression('value', equalSelector, equalSelector);
		chai.expect(letExpression1.equals(letExpression2)).to.equal(true);
		chai.expect(letExpression2.equals(letExpression1)).to.equal(true);
	});

	it('it returns false if compared with an LetExpression with unequal variable name', () => {
		const letExpression1 = new LetExpression('value1', equalSelector, equalSelector),
			letExpression2 = new LetExpression('value2', equalSelector, equalSelector);
		chai.expect(letExpression1.equals(letExpression2)).to.equal(false);
		chai.expect(letExpression2.equals(letExpression1)).to.equal(false);
	});

	it('it returns false if compared with an LetExpression with unequal binding selector', () => {
		const letExpression1 = new LetExpression('value', unequalSelector, equalSelector),
			letExpression2 = new LetExpression('value', unequalSelector, equalSelector);
		chai.expect(letExpression1.equals(letExpression2)).to.equal(false);
		chai.expect(letExpression2.equals(letExpression1)).to.equal(false);
	});

	it('it returns false if compared with an LetExpression with unequal return selector', () => {
		const letExpression1 = new LetExpression('value', equalSelector, unequalSelector),
			letExpression2 = new LetExpression('value', equalSelector, unequalSelector);
		chai.expect(letExpression1.equals(letExpression2)).to.equal(false);
		chai.expect(letExpression2.equals(letExpression1)).to.equal(false);
	});

	it('it returns false if compared with an unequal other LetExpression', () => {
		const letExpression1 = new LetExpression('value1', unequalSelector, unequalSelector),
			letExpression2 = new LetExpression('value2', unequalSelector, unequalSelector);
		chai.expect(letExpression1.equals(letExpression2)).to.equal(false);
		chai.expect(letExpression2.equals(letExpression1)).to.equal(false);
	});
});
