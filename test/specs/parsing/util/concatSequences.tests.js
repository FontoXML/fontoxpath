import Sequence from 'fontoxpath/selectors/dataTypes/Sequence';
import concatSequences from 'fontoxpath/selectors/util/concatSequences';

describe('concatSequences', () => {
	it('concats sequences', () => {
		chai.assert.deepEqual(
			concatSequences([new Sequence([1,2,3]), new Sequence([4,5,6])]).getAllValues(),
			[1,2,3,4,5,6]);
	});
});
