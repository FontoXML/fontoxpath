import argumentListToString from 'fontoxpath/selectors/functions/argumentListToString';
import Sequence from 'fontoxpath/selectors/dataTypes/Sequence';

describe('argumentListToString()', () => {
	it('returns item()? when given an empty Sequence', () => {
		var argumentList = [new Sequence([])];
		chai.assert.equal(argumentListToString(argumentList), 'item()?');
	});

	it('returns type when given a Sequence with 1 item', () => {
		var argumentList = [new Sequence([{ primitiveTypeName: 'type' }])];
		chai.assert.equal(argumentListToString(argumentList), 'type');
	});

	it('returns type when given a Sequence with multiple items', () => {
		var argumentList = [new Sequence([{ primitiveTypeName: 'type' }, { primitiveTypeName: 'type' }])];
		chai.assert.equal(argumentListToString(argumentList), 'type+');
	});

	it('returns a type list when given multiple Sequences', () => {
		var argumentList = [
			new Sequence([]),
			new Sequence([{ primitiveTypeName: 'type' }]),
			new Sequence([{ primitiveTypeName: 'type' }, { primitiveTypeName: 'type' }])];
		chai.assert.equal(argumentListToString(argumentList), 'item()?, type, type+');
	});
});
