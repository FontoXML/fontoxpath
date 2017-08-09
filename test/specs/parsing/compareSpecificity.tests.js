import {
	compareSpecificity
} from 'fontoxpath';

describe('compareSpecificity', () => {
	it('returns 0 for the same xpath',
		() => chai.assert.equal(compareSpecificity('self::*', 'self::*'), 0));
	it('nodeType > universal',
		() => chai.assert.equal(compareSpecificity('self::element()', 'self::node()'), 1));
	it('name > nodeType',
		() => chai.assert.equal(compareSpecificity('self::name', 'self::element()'), 1));
	it('attributes > nodeName',
		() => chai.assert.equal(compareSpecificity('@id', 'self::name'), 1));
	it('functions > attributes',
		() => chai.assert.equal(compareSpecificity('id("123")', '@id'), 1));
	it('union is the maximum of its operands',
		() => chai.assert.equal(compareSpecificity('self::name | id("123") | self::otherName | id("123")', 'self::name'), 1));

});
