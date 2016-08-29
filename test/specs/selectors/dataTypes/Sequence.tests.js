define([
	'slimdom',
	'fontoxml-selectors/selectors/dataTypes/BooleanValue',
	'fontoxml-selectors/selectors/dataTypes/NodeValue',
	'fontoxml-selectors/selectors/dataTypes/Sequence'
], function (
	slimdom,
	BooleanValue,
	NodeValue,
	Sequence
	) {
	'use strict';

	var SlimdomDocument = slimdom.Document;

	describe('Sequence.getEffectiveBooleanValue()', function () {
		it('returns false if the sequence is empty', function () {
			var sequence = new Sequence();

			var result = sequence.getEffectiveBooleanValue();

			chai.expect(result).to.equal(false);
		});

		it('returns true if the first item in the sequence is a NodeValue', function () {
			var doc = new SlimdomDocument();
			var element = doc.createElement('element');
			var sequence = new Sequence([
					new NodeValue({}, element)
				]);

			var result = sequence.getEffectiveBooleanValue();

			chai.expect(result).to.equal(true);
		});

		it('returns the effective boolean value of the first element in the sequence (if it isn\'t a NodeValue)', function () {
			var sequence1 = new Sequence([new BooleanValue(true)]),
				sequence2 = new Sequence([new BooleanValue(false)]);

			var result1 = sequence1.getEffectiveBooleanValue(),
				result2 = sequence2.getEffectiveBooleanValue();

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(false);
		});
	});
});
