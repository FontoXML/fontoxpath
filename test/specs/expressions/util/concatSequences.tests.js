import Sequence from 'fontoxpath/expressions/dataTypes/Sequence';
import concatSequences from 'fontoxpath/expressions/util/concatSequences';

describe('concatSequences', () => {
	it('concats sequences', () => {
		chai.assert.deepEqual(
			concatSequences([new Sequence([1,2,3]), new Sequence([4,5,6])]).getAllValues(),
			[1,2,3,4,5,6]);
	});
});
