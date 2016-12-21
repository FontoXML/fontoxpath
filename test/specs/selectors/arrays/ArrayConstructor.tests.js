import Specificity from 'fontoxml-selectors/selectors/Specificity';
import ArrayConstructor from 'fontoxml-selectors/selectors/arrays/ArrayConstructor';

const equalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(true)
	},
	unequalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(false)
	};

describe('ArrayConstructor.equals()', () => {
	it('returns true if compared with itself', () => {
		const array1 = new ArrayConstructor('square', [equalSelector]),
			array2 = array1;
		chai.assert.isTrue(array1.equals(array2));
		chai.assert.isTrue(array2.equals(array1));
	});

	it('returns true if compared with an equal other ArrayConstructor', () => {
		const array1 = new ArrayConstructor('square', [equalSelector]);
		const array2 = new ArrayConstructor('square', [equalSelector]);
		chai.assert.isTrue(array1.equals(array2));
		chai.assert.isTrue(array2.equals(array1));
	});

	it('returns false if compared with an ArrayConstructor unequal on the first pair', () => {
		const array1 = new ArrayConstructor('square', [unequalSelector]);
		const array2 = new ArrayConstructor('square', [unequalSelector]);
		chai.assert.isFalse(array1.equals(array2));
		chai.assert.isFalse(array2.equals(array1));
	});

	it('returns false if compared with an ArrayConstructor unequal curlyness', () => {
		const array1 = new ArrayConstructor('curly', [equalSelector]);
		const array2 = new ArrayConstructor('square', [equalSelector]);
		chai.assert.isFalse(array1.equals(array2));
		chai.assert.isFalse(array2.equals(array1));
	});

	it('returns false if compared with an ArrayConstructor with unequal size', () => {
		const array1 = new ArrayConstructor('square', [equalSelector, equalSelector]);
		const array2 = new ArrayConstructor('square', [equalSelector]);
		chai.assert.isFalse(array1.equals(array2));
		chai.assert.isFalse(array2.equals(array1));
	});
});
