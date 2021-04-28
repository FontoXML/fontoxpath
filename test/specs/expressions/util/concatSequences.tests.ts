import * as chai from 'chai';
import sequenceFactory from 'fontoxpath/expressions/dataTypes/sequenceFactory';
import Value from 'fontoxpath/expressions/dataTypes/Value';
import concatSequences from 'fontoxpath/expressions/util/concatSequences';

function value(val) {
	return new Value('xs:integer', val);
}

describe('concatSequences', () => {
	it('concats sequences', () => {
		chai.assert.deepEqual(
			concatSequences([
				sequenceFactory.create([value(1), value(2), value(3)]),
				sequenceFactory.create([value(4), value(5), value(6)]),
			]).getAllValues(),
			[value(1), value(2), value(3), value(4), value(5), value(6)]
		);
	});
});
