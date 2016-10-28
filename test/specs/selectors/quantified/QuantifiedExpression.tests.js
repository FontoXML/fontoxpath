import FunctionCall from 'fontoxml-selectors/selectors/functions/FunctionCall';
import QuantifiedExpression from 'fontoxml-selectors/selectors/quantified/QuantifiedExpression';
import Specificity from 'fontoxml-selectors/selectors/Specificity';

const equalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(true)
	},
	unequalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(false)
	};

describe('QuantifiedExpression.equals()', () => {
	it('returns true if compared with itself', () => {
		const quantifiedExpr1 = new QuantifiedExpression('every', [
				['x', new FunctionCall('true', [])]
			], equalSelector),
			quantifiedExpr2 = quantifiedExpr1;
		chai.expect(quantifiedExpr1.equals(quantifiedExpr2)).to.equal(true);
		chai.expect(quantifiedExpr2.equals(quantifiedExpr1)).to.equal(true);
	});

	it('it returns true if compared with an equal other QuantifiedExpression', () => {
		const quantifiedExpr1 = new QuantifiedExpression('every', [
				['x', new FunctionCall('true', [])]
			], equalSelector),
			quantifiedExpr2 = new QuantifiedExpression('every', [
				['x', new FunctionCall('true', [])]
			], equalSelector);
		chai.expect(quantifiedExpr1.equals(quantifiedExpr2)).to.equal(true);
		chai.expect(quantifiedExpr2.equals(quantifiedExpr1)).to.equal(true);
	});

	it('it returns false if compared with a QuantifiedExpression unequal on kind', () => {
		const quantifiedExpr1 = new QuantifiedExpression('every', [
				['x', new FunctionCall('true', [])]
			], equalSelector),
			quantifiedExpr2 = new QuantifiedExpression('some', [
				['x', new FunctionCall('true', [])]
			], equalSelector);
		chai.expect(quantifiedExpr1.equals(quantifiedExpr2)).to.equal(false);
		chai.expect(quantifiedExpr2.equals(quantifiedExpr1)).to.equal(false);
	});

	it('it returns false if compared with a QuantifiedExpression unequal on variable name', () => {
		const quantifiedExpr1 = new QuantifiedExpression('every', [
				['y', new FunctionCall('true', [])]
			], equalSelector),
			quantifiedExpr2 = new QuantifiedExpression('every', [
				['x', new FunctionCall('true', [])]
			], equalSelector);
		chai.expect(quantifiedExpr1.equals(quantifiedExpr2)).to.equal(false);
		chai.expect(quantifiedExpr2.equals(quantifiedExpr1)).to.equal(false);
	});

	it('it returns false if compared with a QuantifiedExpression unequal on variable value', () => {
		const quantifiedExpr1 = new QuantifiedExpression('every', [
				['x', new FunctionCall('false', [])]
			], equalSelector),
			quantifiedExpr2 = new QuantifiedExpression('every', [
				['x', new FunctionCall('true', [])]
			], equalSelector);
		chai.expect(quantifiedExpr1.equals(quantifiedExpr2)).to.equal(false);
		chai.expect(quantifiedExpr2.equals(quantifiedExpr1)).to.equal(false);
	});

	it('it returns false if compared with a QuantifiedExpression unequal on return expression', () => {
		const quantifiedExpr1 = new QuantifiedExpression('every', [
				['x', new FunctionCall('false', [])]
			], unequalSelector),
			quantifiedExpr2 = new QuantifiedExpression('every', [
				['x', new FunctionCall('false', [])]
			], unequalSelector);
		chai.expect(quantifiedExpr1.equals(quantifiedExpr2)).to.equal(false);
		chai.expect(quantifiedExpr2.equals(quantifiedExpr1)).to.equal(false);
	});
});
