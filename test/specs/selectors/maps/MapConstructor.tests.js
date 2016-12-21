import Specificity from 'fontoxml-selectors/selectors/Specificity';
import MapConstructor from 'fontoxml-selectors/selectors/maps/MapConstructor';

const equalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(true)
	},
	unequalSelector = {
		specificity: new Specificity({}),
		equals: sinon.stub().returns(false)
	};

describe('MapConstructor.equals()', () => {
	it('returns true if compared with itself', () => {
		const map1 = new MapConstructor([{ key: equalSelector, value: equalSelector }]),
			map2 = map1;
		chai.assert.isTrue(map1.equals(map2));
		chai.assert.isTrue(map2.equals(map1));
	});

	it('returns true if compared with an equal other MapConstructor', () => {
		const map1 = new MapConstructor([{ key: equalSelector, value: equalSelector }]);
		const map2 = new MapConstructor([{ key: equalSelector, value: equalSelector }]);
		chai.assert.isTrue(map1.equals(map2));
		chai.assert.isTrue(map2.equals(map1));
	});

	it('returns false if compared with an MapConstructor unequal on the first pair', () => {
		const map1 = new MapConstructor([{ key: unequalSelector, value: unequalSelector }]);
		const map2 = new MapConstructor([{ key: unequalSelector, value: equalSelector }]);
		chai.assert.isFalse(map1.equals(map2));
		chai.assert.isFalse(map2.equals(map1));
	});

	it('returns false if compared with an MapConstructor with unequal size', () => {
		const map1 = new MapConstructor([{ key: equalSelector, value: equalSelector }, { key: equalSelector, value: equalSelector }]);
		const map2 = new MapConstructor([{ key: equalSelector, value: equalSelector }]);
		chai.assert.isFalse(map1.equals(map2));
		chai.assert.isFalse(map2.equals(map1));
	});
});
