import FunctionCall from 'fontoxml-selectors/selectors/functions/FunctionCall';
import Specificity from 'fontoxml-selectors/selectors/Specificity';

const equalSelector = {
			specificity: new Specificity({}),
			equals: sinon.stub().returns(true)
		},
	unequalSelector = {
			specificity: new Specificity({}),
			equals: sinon.stub().returns(false)
		};

describe('FunctionCall.equals()', () => {
	it('returns true if compared with itself', () => {
		var functionCall1 = new FunctionCall(equalSelector, [equalSelector, equalSelector]),
			functionCall2 = functionCall1;
		chai.assert.isTrue(functionCall1.equals(functionCall2));
		chai.assert.isTrue(functionCall2.equals(functionCall1));
	});

	it('returns true if compared with an equal other FunctionCall', () => {
		var functionCall1 = new FunctionCall(equalSelector, [equalSelector, equalSelector]),
			functionCall2 = new FunctionCall(equalSelector, [equalSelector, equalSelector]);
		chai.assert.isTrue(functionCall1.equals(functionCall2));
		chai.assert.isTrue(functionCall2.equals(functionCall1));
	});

	it('returns false if compared with an unequal other FunctionCall (unequal function lookup)', () => {
		var functionCall1 = new FunctionCall(unequalSelector, [equalSelector, equalSelector]),
			functionCall2 = new FunctionCall(unequalSelector, [equalSelector, equalSelector]);
		chai.assert.isFalse(functionCall1.equals(functionCall2));
		chai.assert.isFalse(functionCall2.equals(functionCall1));
	});

	it('returns false if compared with an unequal other FunctionCall (unequal arg list)', () => {
		var functionCall1 = new FunctionCall(equalSelector, [unequalSelector, equalSelector]),
			functionCall2 = new FunctionCall(equalSelector, [unequalSelector, equalSelector]);
		chai.assert.isFalse(functionCall1.equals(functionCall2));
		chai.assert.isFalse(functionCall2.equals(functionCall1));
	});
});
