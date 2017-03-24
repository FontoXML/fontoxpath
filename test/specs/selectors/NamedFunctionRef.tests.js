import NamedFunctionRef from 'fontoxpath/selectors/NamedFunctionRef';

describe('NamedFunctionRef.equals()', () => {
	it('returns true if compared with itself', () => {
		var namedFunctionRef1 = new NamedFunctionRef('true', 0),
			namedFunctionRef2 = namedFunctionRef1;
		chai.assert.isTrue(namedFunctionRef1.equals(namedFunctionRef2));
		chai.assert.isTrue(namedFunctionRef2.equals(namedFunctionRef1));
	});

	it('it returns true if compared with an equal other NamedFunctionRef', () => {
		var namedFunctionRef1 = new NamedFunctionRef('true', 0),
			namedFunctionRef2 = new NamedFunctionRef('true', 0);
		chai.assert.isTrue(namedFunctionRef1.equals(namedFunctionRef2));
		chai.assert.isTrue(namedFunctionRef2.equals(namedFunctionRef1));
	});

	it('it returns false if compared with an unequal other NamedFunctionRef (unequal function name)', () => {
		var namedFunctionRef1 = new NamedFunctionRef('true', 0),
			namedFunctionRef2 = new NamedFunctionRef('false', 0);
		chai.assert.isFalse(namedFunctionRef1.equals(namedFunctionRef2));
		chai.assert.isFalse(namedFunctionRef2.equals(namedFunctionRef1));
	});

	it('it returns false if compared with an unequal other NamedFunctionRef (unequal function arity)', () => {
		var namedFunctionRef1 = new NamedFunctionRef('concat', 2),
			namedFunctionRef2 = new NamedFunctionRef('concat', 4);
		chai.assert.isFalse(namedFunctionRef1.equals(namedFunctionRef2));
		chai.assert.isFalse(namedFunctionRef2.equals(namedFunctionRef1));
	});
});
