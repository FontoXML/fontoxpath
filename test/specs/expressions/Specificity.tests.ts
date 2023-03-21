import * as chai from 'chai';
import Specificity from 'fontoxpath/expressions/Specificity';

describe('Specificity.compareTo()', () => {
	it('returns -1 if the specificity is less than the other specificity, based on selector value', () => {
		const specificity1 = new Specificity({});
		const specificity2 = new Specificity({
			attribute: 1,
		});
		chai.assert.equal(specificity1.compareTo(specificity2), -1);
	});

	it('returns 0 if the specificity is equal to the other specificity, based on selector value', () => {
		const specificity1 = new Specificity({});
		const specificity2 = new Specificity({});
		chai.assert.equal(specificity1.compareTo(specificity2), 0);
	});

	it('returns 1 if the specificity is greater than the other specificity, based on selector value', () => {
		const specificity1 = new Specificity({
			attribute: 1,
		});
		const specificity2 = new Specificity({});
		chai.assert.equal(specificity1.compareTo(specificity2), 1);
	});

	it('returns -1 if the specificity is less than the other specificity, based on multiple values', () => {
		const specificity1 = new Specificity({
			nodeName: 10,
		});
		const specificity2 = new Specificity({
			attribute: 1,
		});
		chai.assert.equal(specificity1.compareTo(specificity2), -1);
	});

	it('returns 0 if the specificity is equal to the other specificity, based on multiple values', () => {
		const specificity1 = new Specificity({
			nodeName: 2,
			nodeType: 5,
		});
		const specificity2 = new Specificity({
			nodeName: 2,
			nodeType: 5,
		});
		chai.assert.equal(specificity1.compareTo(specificity2), 0);
	});

	it('returns 1 if the specificity is greater than the other specificity, based on multiple values', () => {
		const specificity1 = new Specificity({
			external: 2,
			attribute: 1,
		});
		const specificity2 = new Specificity({
			nodeType: 5,
		});
		chai.assert.equal(specificity1.compareTo(specificity2), 1);
	});
});

describe('Specificity.add()', () => {
	it('adds two specificities together with different dimensions', () => {
		const specificity1 = new Specificity({
			external: 1,
		});
		const specificity2 = new Specificity({
			attribute: 1,
		});
		const specificity3 = new Specificity({
			external: 1,
			attribute: 1,
		});
		chai.assert.deepEqual(specificity1.add(specificity2), specificity3);
	});

	it('add two specificities together with same dimensions set', () => {
		const specificity1 = new Specificity({
			external: 1,
			attribute: 2,
		});
		const specificity2 = new Specificity({
			attribute: 5,
		});
		const specificity3 = new Specificity({
			external: 1,
			attribute: 7,
		});
		chai.assert.deepEqual(specificity1.add(specificity2), specificity3);
	});
});
