import * as chai from 'chai';
import argumentListToString from 'fontoxpath/expressions/functions/argumentListToString';
import sequenceFactory from 'fontoxpath/expressions/dataTypes/sequenceFactory';

describe('argumentListToString()', () => {
	it('returns item()? when given an empty Sequence', () => {
		var argumentList = [sequenceFactory.create([])];
		chai.assert.equal(argumentListToString(argumentList), 'item()?');
	});

	it('returns type when given a Sequence with 1 item', () => {
		var argumentList = [sequenceFactory.create([{ type: 'type', value: null }])];
		chai.assert.equal(argumentListToString(argumentList), 'type');
	});

	it('returns type when given a Sequence with multiple items', () => {
		var argumentList = [sequenceFactory.create([{ type: 'type', value: null }, { type: 'type', value: null }])];
		chai.assert.equal(argumentListToString(argumentList), 'type+');
	});

	it('returns a type list when given multiple Sequences', () => {
		const argumentList = [
			sequenceFactory.create([]),
			sequenceFactory.create([{ type: 'type', value: null }]),
			sequenceFactory.create([{ type: 'type', value: null }, { type: 'type', value: null }])];
		chai.assert.equal(argumentListToString(argumentList), 'item()?, type, type+');
	});
});
