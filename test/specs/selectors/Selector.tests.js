import Selector from 'fontoxml-selectors/selectors/Selector';

describe('Selector.equals()', () => {
	it('throws when called', () => {
		const selector = new Selector({}, '');

		chai.expect(selector.equals).to.throw();
	});
});

describe('Selector.getBucket()', () => {
	it('throws when called', () => {
		const selector = new Selector({}, '');

		chai.expect(selector.getBucket()).to.equal(null);
	});
});

describe('Selector.evaluate()', () => {
	it('throws when called', () => {
		const selector = new Selector({}, '');

		chai.expect(selector.evaluate).to.throw();
	});
});
