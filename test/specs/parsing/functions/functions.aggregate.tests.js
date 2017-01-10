import slimdom from 'slimdom';

import { domFacade } from 'fontoxpath';
import { evaluateXPathToNumber,  evaluateXPathToBoolean, evaluateXPathToString, evaluateXPathToStrings } from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('aggregate functions', () => {
	describe('avg', () => {
		it('returns the empty sequence if the empty sequence is passed',
		   () => chai.assert.deepEqual(evaluateXPathToStrings('avg(())', documentNode, domFacade), []));
		it('returns the avg of integers',
		   () => chai.assert(evaluateXPathToNumber('avg((1, 2, 3))', documentNode, domFacade) === 2));
		it('returns the avg of integers as a double value',
		   () => chai.assert(evaluateXPathToBoolean('avg((1, 2)) instance of xs:double', documentNode, domFacade)));
		it('returns the avg of integers as a double',
		   () => chai.assert(evaluateXPathToBoolean('avg((1, 2)) = 1.5', documentNode, domFacade), 'avg of 1 and 2 is 1.5'));
		it('returns the avg of decimals',
		   () => chai.assert(evaluateXPathToBoolean('avg((1.5, 2.0, 2.5)) instance of xs:decimal', documentNode, domFacade)));
		it('returns the avg of doubles as a double',
		   () => chai.assert.equal(evaluateXPathToNumber('avg((1.5, 2.0, 2.5))', documentNode, domFacade), 2));
		it('returns the avg of double',
		   () => chai.assert.equal(evaluateXPathToNumber('avg((1e-1, 1e1))', documentNode, domFacade), 5.05));
		it('returns the avg of doubles as a double',
		   () => chai.assert(evaluateXPathToBoolean('avg((1e-1, 1e1)) instance of xs:double', documentNode, domFacade)));
		it('returns the avg of mixed doubles and decimals as a double',
		   () => chai.assert(evaluateXPathToBoolean('avg((1e-1, 1.0)) instance of xs:double', documentNode, domFacade)));

		it('casts untypedAtomic to double');
	});

	describe('count()', () => {
		it('returns the length of the sequence',
		   () => chai.assert(evaluateXPathToNumber('count((1 to 1000))', documentNode, domFacade) === 1000));
		it('returns the length of the empty sequence',
		   () => chai.assert(evaluateXPathToNumber('count(())', documentNode, domFacade) === 0));
		it('returns the length of a singleton sequence',
		   () => chai.assert(evaluateXPathToNumber('count((1))', documentNode, domFacade) === 1));
	});

	describe('max()', () => {
		it('returns the max of integers',
		   () => chai.assert(evaluateXPathToNumber('max((1,3,2))', documentNode, domFacade) === 3));
		it('returns the max of integers as an integer',
		   () => chai.assert(evaluateXPathToBoolean('max((1,3,2)) instance of xs:integer', documentNode, domFacade)));
		it('returns the max of strings',
		   () => chai.assert(evaluateXPathToString('max(("a", "b", "c"))', documentNode, domFacade) === 'c'));
		it('returns the max of mixed decimals and integers',
		   () => chai.assert(evaluateXPathToNumber('max((1, 1.5, 0.5))', documentNode, domFacade) === 1.5));
		it('returns the max of mixed decimals and integers as a decimal',
		   () => chai.assert(evaluateXPathToBoolean('max((1, 1.5, 0.5)) instance of xs:decimal', documentNode, domFacade)));
		it('returns the max of mixed decimals, doubles and integers',
		   () => chai.assert(evaluateXPathToNumber('max((1, 1.5, 0.5e1))', documentNode, domFacade) === 5));
		it('throws a type error if the values are not of the same type',
		   () => chai.assert.throws(() => evaluateXPathToNumber('max((1, "zero"))', documentNode, domFacade), 'FORG0006'));
		it('returns NaN if one of the values is NaN',
		   () => chai.assert.isNaN(evaluateXPathToNumber('max((1, number("zero")))', documentNode, domFacade)));
		it('returns the empty sequence when passed the empty sequence',
		   () => chai.assert.deepEqual(evaluateXPathToStrings('max(())', documentNode, domFacade), []));
		// TODO: when we have support for creating untypedAtomicValue items, when we have implemented the function conversion
		it('casts untypedAtomic to double');

		it('does not support setting the collation',
		   () => chai.assert.throws(() => evaluateXPathToNumber('max((), "")', documentNode, domFacade)));
	});

	describe('min()', () => {
		it('returns the min of integers',
		   () => chai.assert(evaluateXPathToNumber('min((1,3,2))', documentNode, domFacade) === 1));
		it('returns the min of strings',
		   () => chai.assert(evaluateXPathToString('min(("a", "b", "c"))', documentNode, domFacade) === 'a'));
		it('returns the min of mixed decimals and integers',
		   () => chai.assert(evaluateXPathToNumber('min((1, 1.5, 0.5))', documentNode, domFacade) === 0.5));
		it('returns the min of mixed decimals, doubles and integers',
		   () => chai.assert(evaluateXPathToNumber('min((1, 1.5, 0.5e-1))', documentNode, domFacade) === 0.05));
		it('throws a type error if the values are not of the same type',
		   () => chai.assert.throws(() => evaluateXPathToNumber('min((1, "zero"))', documentNode, domFacade), 'FORG0006'));
		it('returns NaN if one of the values is NaN',
		   () => chai.assert.isNaN(evaluateXPathToNumber('min((1, number("zero")))', documentNode, domFacade)));
		it('returns the empty sequence when passed the empty sequence',
		   () => chai.assert.deepEqual(evaluateXPathToStrings('min(())', documentNode, domFacade), []));
		// TODO: when we have support for creating untypedAtomicValue items, when we have implemented the function conversion
		it('casts untypedAtomic to double');

		it('does not support setting the collation',
		   () => chai.assert.throws(() => evaluateXPathToNumber('min((), "")', documentNode, domFacade)));
	});

	describe('sum', () => {
		it('returns zero if the empty sequence is passed',
		   () => chai.assert(evaluateXPathToNumber('sum(())', documentNode, domFacade) === 0));
		it('returns the $zero argument if the empty sequence is passed',
		   () => chai.assert(evaluateXPathToString('sum((), "ZERO")', documentNode, domFacade) === 'ZERO'));
		it('returns the sum of integers',
		   () => chai.assert(evaluateXPathToNumber('sum((1, 2, 3))', documentNode, domFacade) === 6));
		it('returns the sum of decimals',
		   () => chai.assert(evaluateXPathToNumber('sum((1.5, 2.0, 2.5))', documentNode, domFacade) === 6));
		it('returns the sum of doubles',
		   () => chai.assert(evaluateXPathToNumber('sum((1e-1, 1e1))', documentNode, domFacade) === 10.1));
		it('returns the sum of doubles as a double',
		   () => chai.assert.isTrue(evaluateXPathToBoolean('sum((1e-1, 1e1)) instance of xs:double', documentNode, domFacade)));
		it('returns the sum of integers as an integer',
		   () => chai.assert.isTrue(evaluateXPathToBoolean('sum((1, 1)) instance of xs:integer', documentNode, domFacade)));
		it('returns the sum of decimals as a decimal',
		   () => chai.assert.isTrue(evaluateXPathToBoolean('sum((1.0, 1.0)) instance of xs:decimal', documentNode, domFacade)));
		it('returns the sum of floats as a float');

		it('casts untypedAtomic to double');
	});
});
