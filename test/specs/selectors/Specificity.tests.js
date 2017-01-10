import Specificity from 'fontoxpath/selectors/Specificity';

describe('Specificity.compareTo()', () => {
	it('returns -1 if the specificity is less than the other specificity, based on selector value', () => {
		const specificity1 = new Specificity({}),
			specificity2 = new Specificity({
				attribute: 1
			});
		chai.expect(specificity1.compareTo(specificity2)).to.equal(-1);
	});

	it('returns 0 if the specificity is equal to the other specificity, based on selector value', () => {
		const specificity1 = new Specificity({}),
			specificity2 = new Specificity({});
		chai.expect(specificity1.compareTo(specificity2)).to.equal(0);
	});

	it('returns 1 if the specificity is greater than the other specificity, based on selector value', () => {
		const specificity1 = new Specificity({
				attribute: 1
			}),
			specificity2 = new Specificity({});
		chai.expect(specificity1.compareTo(specificity2)).to.equal(1);
	});

	it('returns -1 if the specificity is less than the other specificity, based on multiple values', () => {
		const specificity1 = new Specificity({
				nodeName: 10
			}),
			specificity2 = new Specificity({
				attribute: 1
			});
		chai.expect(specificity1.compareTo(specificity2)).to.equal(-1);
	});

	it('returns 0 if the specificity is equal to the other specificity, based on multiple values', () => {
		const specificity1 = new Specificity({
				nodeName: 2,
				nodeType: 5
			}),
			specificity2 = new Specificity({
				nodeName: 2,
				nodeType: 5
			});
		chai.expect(specificity1.compareTo(specificity2)).to.equal(0);
	});

	it('returns 1 if the specificity is greater than the other specificity, based on multiple values', () => {
		const specificity1 = new Specificity({
				external: 2,
				attribute: 1
			}),
			specificity2 = new Specificity({
				nodeType: 5
			});
		chai.expect(specificity1.compareTo(specificity2)).to.equal(1);
	});
});

describe('Specificity.add()', () => {
	it('adds two specificities together with different dimensions', () => {
		const specificity1 = new Specificity({
				external: 1
			}),
			specificity2 = new Specificity({
				attribute: 1
			}),
			specificity3 = new Specificity({
				external: 1,
				attribute: 1
			});
		chai.expect(specificity1.add(specificity2)).to.deep.equal(specificity3);
	});

	it('add two specificities together with same dimensions set', () => {
		const specificity1 = new Specificity({
				external: 1,
				attribute: 2
			}),
			specificity2 = new Specificity({
				attribute: 5
			}),
			specificity3 = new Specificity({
				external: 1,
				attribute: 7
			});
		chai.expect(specificity1.add(specificity2)).to.deep.equal(specificity3);
	});
});
