import * as chai from 'chai';
import argumentListToString from 'fontoxpath/expressions/functions/argumentListToString';
import SequenceFactory from 'fontoxpath/expressions/dataTypes/SequenceFactory';

describe('argumentListToString()', () => {
	it('returns item()? when given an empty Sequence', () => {
		var argumentList = [SequenceFactory.create([])];
		chai.assert.equal(argumentListToString(argumentList), 'item()?');
	});

	it('returns type when given a Sequence with 1 item', () => {
		var argumentList = [SequenceFactory.create([{ type: 'type', value: null }])];
		chai.assert.equal(argumentListToString(argumentList), 'type');
	});

	it('returns type when given a Sequence with multiple items', () => {
		var argumentList = [SequenceFactory.create([{ type: 'type', value: null }, { type: 'type', value: null }])];
		chai.assert.equal(argumentListToString(argumentList), 'type+');
	});

	it('returns a type list when given multiple Sequences', () => {
		const argumentList = [
			SequenceFactory.create([]),
			SequenceFactory.create([{ type: 'type', value: null }]),
			SequenceFactory.create([{ type: 'type', value: null }, { type: 'type', value: null }])];
		chai.assert.equal(argumentListToString(argumentList), 'item()?, type, type+');
	});
});
