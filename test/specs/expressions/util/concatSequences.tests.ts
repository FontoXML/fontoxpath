import * as chai from 'chai';
import SequenceFactory from 'fontoxpath/expressions/dataTypes/SequenceFactory';
import concatSequences from 'fontoxpath/expressions/util/concatSequences';

function value(val) {
	return {
		type: 'xs:integer',
		value: val
	}
}

describe('concatSequences', () => {
	it('concats sequences', () => {
		chai.assert.deepEqual(
			concatSequences([SequenceFactory.create([value(1), value(2), value(3)]), SequenceFactory.create([value(4), value(5), value(6)])]).getAllValues(),
			[value(1), value(2), value(3), value(4), value(5), value(6)]);
	});
});
