import slimdom from 'slimdom';

import BooleanValue from 'fontoxpath/selectors/dataTypes/BooleanValue';
import NodeValue from 'fontoxpath/selectors/dataTypes/NodeValue';
import Sequence from 'fontoxpath/selectors/dataTypes/Sequence';
import { domFacade } from 'fontoxpath';

let documentNode = new slimdom.Document();

describe('Sequence.isEmpty()', () => {
	it('returns true if the sequence is empty', () => {
		const sequence = new Sequence();
		chai.expect(sequence.isEmpty()).to.equal(true);
	});

	it('returns false if the sequence is not empty', () => {
		const sequence = new Sequence([new BooleanValue(true)]);
		chai.expect(sequence.isEmpty()).to.equal(false);
	});
});

describe('Sequence.isSingleton()', () => {
	it('returns true if the sequence is a singleton', () => {
		const sequence = new Sequence([new BooleanValue(true)]);
		chai.expect(sequence.isSingleton()).to.equal(true);
	});

	it('returns false if the sequence is empty', () => {
		const sequence = new Sequence();
		chai.expect(sequence.isSingleton()).to.equal(false);
	});

	it('returns true if the sequence contains more than one item', () => {
		const sequence = new Sequence([new BooleanValue(true), new BooleanValue(false)]);
		chai.expect(sequence.isSingleton()).to.equal(false);
	});
});

describe('Sequence.getEffectiveBooleanValue()', () => {
	it('returns false if the sequence is empty', () => {
		const sequence = new Sequence();
		chai.expect(sequence.getEffectiveBooleanValue()).to.equal(false);
	});

	it('returns true if the first item in the sequence is a NodeValue', () => {
		const sequence = new Sequence([new NodeValue(domFacade, documentNode.createElement('someElement'))]);
		chai.expect(sequence.getEffectiveBooleanValue()).to.equal(true);
	});

	it('returns the effective boolean value of the first element in the sequence (if it isn\'t a NodeValue)', () => {
		const sequence1 = new Sequence([new BooleanValue(true)]),
			sequence2 = new Sequence([new BooleanValue(false)]);
		chai.expect(sequence1.getEffectiveBooleanValue()).to.equal(true);
		chai.expect(sequence2.getEffectiveBooleanValue()).to.equal(false);
	});

	it('throws if the sequence has more than one value, and the first value is not a NodeValue', () => {
		const sequence = new Sequence([new BooleanValue(true), new BooleanValue(false)]);
		chai.expect(sequence.getEffectiveBooleanValue).to.throw();
	});
});

describe('Sequence.merge()', () => {
	it('merges two sequences', () => {
		const sequenceToMerge1 = new Sequence([new BooleanValue(true), new BooleanValue(false)]),
			sequenceToMerge2 = new Sequence([new BooleanValue(true)]),
			sequenceResult = new Sequence([new BooleanValue(true), new BooleanValue(false), new BooleanValue(true)]);
		chai.expect(sequenceToMerge1.merge(sequenceToMerge2)).to.deep.equal(sequenceResult);
	});
});
