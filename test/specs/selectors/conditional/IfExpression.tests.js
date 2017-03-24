import IfExpression from 'fontoxpath/selectors/conditional/IfExpression';
import Specificity from 'fontoxpath/selectors/Specificity';

const equalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(true)
	},
	unequalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(false)
	};

describe('IfExpression.equals()', () => {
	it('returns true if compared with itself', () => {
		const quantifiedExpr1 = new IfExpression(
				equalSelector,
				equalSelector,
				equalSelector),
			quantifiedExpr2 = quantifiedExpr1;
		chai.assert.isTrue(quantifiedExpr1.equals(quantifiedExpr2));
		chai.assert.isTrue(quantifiedExpr2.equals(quantifiedExpr1));
	});

	it('it returns true if compared with an equal other IfExpression', () => {
		const quantifiedExpr1 = new IfExpression(
				equalSelector,
				equalSelector,
				equalSelector),
			quantifiedExpr2 = new IfExpression(
				equalSelector,
				equalSelector,
				equalSelector);
		chai.assert.isTrue(quantifiedExpr1.equals(quantifiedExpr2));
		chai.assert.isTrue(quantifiedExpr2.equals(quantifiedExpr1));
	});

	it('it returns false if compared with a IfExpression unequal on test', () => {
		const quantifiedExpr1 = new IfExpression(
				unequalSelector,
				equalSelector,
				equalSelector),
			quantifiedExpr2 = new IfExpression(
				unequalSelector,
				equalSelector,
				equalSelector);
		chai.assert.isFalse(quantifiedExpr1.equals(quantifiedExpr2));
		chai.assert.isFalse(quantifiedExpr2.equals(quantifiedExpr1));
	});

	it('it returns false if compared with a IfExpression unequal on then', () => {
		const quantifiedExpr1 = new IfExpression(
				equalSelector,
				unequalSelector,
				equalSelector),
			quantifiedExpr2 = new IfExpression(
				equalSelector,
				unequalSelector,
				equalSelector);
		chai.assert.isFalse(quantifiedExpr1.equals(quantifiedExpr2));
		chai.assert.isFalse(quantifiedExpr2.equals(quantifiedExpr1));
	});

	it('it returns false if compared with a IfExpression unequal on else', () => {
		const quantifiedExpr1 = new IfExpression(
				equalSelector,
				equalSelector,
				unequalSelector),
			quantifiedExpr2 = new IfExpression(
				equalSelector,
				equalSelector,
				unequalSelector);
		chai.assert.isFalse(quantifiedExpr1.equals(quantifiedExpr2));
		chai.assert.isFalse(quantifiedExpr2.equals(quantifiedExpr1));
	});
});
