import * as chai from 'chai';
import SequenceFactory from 'fontoxpath/expressions/dataTypes/SequenceFactory';
import concatSequences from 'fontoxpath/expressions/util/concatSequences';

describe('concatSequences', () => {
	it('concats sequences', () => {
		chai.assert.deepEqual(
			concatSequences([SequenceFactory.create([1,2,3]), SequenceFactory.create([4,5,6])]).getAllValues(),
			[1,2,3,4,5,6]);
	});
});
