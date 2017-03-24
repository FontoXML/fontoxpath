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
		chai.assert.isTrue(letExpression1.equals(letExpression2));
		chai.assert.isTrue(letExpression2.equals(letExpression1));
	});

	it('it returns true if compared with an equal other LetExpression', () => {
		const letExpression1 = new LetExpression('value', equalSelector, equalSelector),
			letExpression2 = new LetExpression('value', equalSelector, equalSelector);
		chai.assert.isTrue(letExpression1.equals(letExpression2));
		chai.assert.isTrue(letExpression2.equals(letExpression1));
	});

	it('it returns false if compared with an LetExpression with unequal variable name', () => {
		const letExpression1 = new LetExpression('value1', equalSelector, equalSelector),
			letExpression2 = new LetExpression('value2', equalSelector, equalSelector);
		chai.assert.isFalse(letExpression1.equals(letExpression2));
		chai.assert.isFalse(letExpression2.equals(letExpression1));
	});

	it('it returns false if compared with an LetExpression with unequal binding selector', () => {
		const letExpression1 = new LetExpression('value', unequalSelector, equalSelector),
			letExpression2 = new LetExpression('value', unequalSelector, equalSelector);
		chai.assert.isFalse(letExpression1.equals(letExpression2));
		chai.assert.isFalse(letExpression2.equals(letExpression1));
	});

	it('it returns false if compared with an LetExpression with unequal return selector', () => {
		const letExpression1 = new LetExpression('value', equalSelector, unequalSelector),
			letExpression2 = new LetExpression('value', equalSelector, unequalSelector);
		chai.assert.isFalse(letExpression1.equals(letExpression2));
		chai.assert.isFalse(letExpression2.equals(letExpression1));
	});

	it('it returns false if compared with an unequal other LetExpression', () => {
		const letExpression1 = new LetExpression('value1', unequalSelector, unequalSelector),
			letExpression2 = new LetExpression('value2', unequalSelector, unequalSelector);
		chai.assert.isFalse(letExpression1.equals(letExpression2));
		chai.assert.isFalse(letExpression2.equals(letExpression1));
	});
});
