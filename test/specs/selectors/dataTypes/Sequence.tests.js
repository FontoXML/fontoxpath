import slimdom from 'slimdom';

import BooleanValue from 'fontoxpath/selectors/dataTypes/BooleanValue';
import NodeValue from 'fontoxpath/selectors/dataTypes/NodeValue';
import Sequence from 'fontoxpath/selectors/dataTypes/Sequence';
import { domFacade } from 'fontoxpath';

const documentNode = new slimdom.Document();

describe('Sequence.isEmpty()', () => {
	it('returns true if the sequence is empty', () => {
		const sequence = new Sequence([]);
		chai.assert.isTrue(sequence.isEmpty());
	});

	it('returns false if the sequence is not empty', () => {
		const sequence = new Sequence([new BooleanValue(true)]);
		chai.assert.isFalse(sequence.isEmpty());
	});
});

describe('Sequence.isSingleton()', () => {
	it('returns true if the sequence is a singleton', () => {
		const sequence = new Sequence([new BooleanValue(true)]);
		chai.assert.isTrue(sequence.isSingleton());
	});

	it('returns false if the sequence is empty', () => {
		const sequence = new Sequence([]);
		chai.assert.isFalse(sequence.isSingleton());
	});

	it('returns true if the sequence contains more than one item', () => {
		const sequence = new Sequence([new BooleanValue(true), new BooleanValue(false)]);
		chai.assert.isFalse(sequence.isSingleton());
	});
});

describe('Sequence.getEffectiveBooleanValue()', () => {
	it('returns false if the sequence is empty', () => {
		const sequence = new Sequence([]);
		chai.assert.isFalse(sequence.getEffectiveBooleanValue());
	});

	it('returns true if the first item in the sequence is a NodeValue', () => {
		const sequence = new Sequence([new NodeValue(domFacade, documentNode.createElement('someElement'))]);
		chai.assert.isTrue(sequence.getEffectiveBooleanValue());
	});

	it('returns the effective boolean value of the first element in the sequence (if it isn\'t a NodeValue)', () => {
		const sequence1 = new Sequence([new BooleanValue(true)]),
			sequence2 = new Sequence([new BooleanValue(false)]);
		chai.assert.isTrue(sequence1.getEffectiveBooleanValue());
		chai.assert.isFalse(sequence2.getEffectiveBooleanValue());
	});

	it('throws if the sequence has more than one value, and the first value is not a NodeValue', () => {
		const sequence = new Sequence([new BooleanValue(true), new BooleanValue(false)]);
		chai.assert.throw(sequence.getEffectiveBooleanValue);
	});
});

describe('Sequence.merge()', () => {
	it('merges two sequences', () => {
		const sequenceToMerge1 = new Sequence([new BooleanValue(true), new BooleanValue(false)]),
			sequenceToMerge2 = new Sequence([new BooleanValue(true)]),
			sequenceResult = new Sequence([new BooleanValue(true), new BooleanValue(false), new BooleanValue(true)]);
		chai.assert.deepEqual(sequenceToMerge1.merge(sequenceToMerge2), sequenceResult);
	});
});
