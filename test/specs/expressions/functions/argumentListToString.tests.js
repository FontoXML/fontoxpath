import chai from 'chai';
import argumentListToString from 'fontoxpath/expressions/functions/argumentListToString';
import Sequence from 'fontoxpath/expressions/dataTypes/Sequence';

describe('argumentListToString()', () => {
	it('returns item()? when given an empty Sequence', () => {
		var argumentList = [Sequence.create([])];
		chai.assert.equal(argumentListToString(argumentList), 'item()?');
	});

	it('returns type when given a Sequence with 1 item', () => {
		var argumentList = [Sequence.create([{ type: 'type' }])];
		chai.assert.equal(argumentListToString(argumentList), 'type');
	});

	it('returns type when given a Sequence with multiple items', () => {
		var argumentList = [Sequence.create([{ type: 'type' }, { type: 'type' }])];
		chai.assert.equal(argumentListToString(argumentList), 'type+');
	});

	it('returns a type list when given multiple Sequences', () => {
		var argumentList = [
			Sequence.create([]),
			Sequence.create([{ type: 'type' }]),
			Sequence.create([{ type: 'type' }, { type: 'type' }])];
		chai.assert.equal(argumentListToString(argumentList), 'item()?, type, type+');
	});
});
