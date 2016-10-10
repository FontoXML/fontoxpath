define([
	'fontoxml-selectors/selectors/Selector'
], function (
	Selector
) {
	'use strict';

	describe('Selector.equals()', function () {
		it('throws when called', function () {
			var selector = new Selector({}, '');

			chai.expect(selector.equals).to.throw();
		});
	});

	describe('Selector.getBucket()', function () {
		it('throws when called', function () {
			var selector = new Selector({}, '');

			chai.expect(selector.getBucket()).to.equal(null);
		});
	});

	describe('Selector.evaluate()', function () {
		it('throws when called', function () {
			var selector = new Selector({}, '');

			chai.expect(selector.evaluate).to.throw();
		});
	});
});
