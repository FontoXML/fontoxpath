import chai from 'chai';
import Sequence from 'fontoxpath/expressions/dataTypes/Sequence';
import concatSequences from 'fontoxpath/expressions/util/concatSequences';

describe('concatSequences', () => {
	it('concats sequences', () => {
		chai.assert.deepEqual(
			concatSequences([Sequence.create([1,2,3]), Sequence.create([4,5,6])]).getAllValues(),
			[1,2,3,4,5,6]);
	});
});
