define([
	'fontoxml-selectors/selectors/AttributeSelector'
], function (
	AttributeSelector
) {
	'use strict';

	describe('AttributeSelector.equals()', function () {
		it('returns true if the attribute selectors are the same (object)', function () {
			var attributeSelector1 = new AttributeSelector('id', ['1']),
				attributeSelector2 = attributeSelector1;

			var result1 = attributeSelector1.equals(attributeSelector2),
				result2 = attributeSelector2.equals(attributeSelector1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('returns true if the attribute selectors are the same (attribute name and value(s))', function () {
			var attributeSelector1 = new AttributeSelector('id', ['1']),
				attributeSelector2 = new AttributeSelector('id', ['1']);

			var result1 = attributeSelector1.equals(attributeSelector2),
				result2 = attributeSelector2.equals(attributeSelector1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('returns true if the attribute selectors are the same (attribute name only, with no values)', function () {
			var attributeSelector1 = new AttributeSelector('id'),
				attributeSelector2 = new AttributeSelector('id');

			var result1 = attributeSelector1.equals(attributeSelector2),
				result2 = attributeSelector2.equals(attributeSelector1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('returns false if the attribute selectors are different (attribute name and value)', function () {
			var attributeSelector1 = new AttributeSelector('class', ['paragraph']),
				attributeSelector2 = new AttributeSelector('id', ['1']);

			var result1 = attributeSelector1.equals(attributeSelector2),
				result2 = attributeSelector2.equals(attributeSelector1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});

		it('returns false if the attribute selectors are different (attribute value(s))', function () {
			var attributeSelector1 = new AttributeSelector('class', ['paragraph', 'title']),
				attributeSelector2 = new AttributeSelector('class', ['paragraph']);

			var result1 = attributeSelector1.equals(attributeSelector2),
				result2 = attributeSelector2.equals(attributeSelector1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});

		it('returns false if the attribute selectors are different (one of the selectors does not have a attribute value set)', function () {
			var attributeSelector1 = new AttributeSelector('class'),
				attributeSelector2 = new AttributeSelector('class', ['paragraph']);

			var result1 = attributeSelector1.equals(attributeSelector2),
				result2 = attributeSelector2.equals(attributeSelector1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
		});

	});
});
