define([
	'fontoxml-selectors/selectors/functions/isValidArgument',
	'fontoxml-selectors/selectors/dataTypes/BooleanValue',
	'fontoxml-selectors/selectors/dataTypes/Sequence'
], function (
	isValidArgument,
	BooleanValue,
	Sequence
) {
	'use strict';

	describe('isValidArgument()', function () {
		it('return true for a valid argument (xs:boolean)', function () {
			var argumentSequence = new Sequence([new BooleanValue(true)]);
			chai.expect(isValidArgument('xs:boolean', argumentSequence)).to.equal(true);
		});

		it('return true for a valid argument (xs:boolean?)', function () {
			var argumentSequence1 = new Sequence([new BooleanValue(true)]),
				argumentSequence2 = new Sequence([]);
			chai.expect(isValidArgument('xs:boolean?', argumentSequence1)).to.equal(true);
			chai.expect(isValidArgument('xs:boolean?', argumentSequence2)).to.equal(true);
		});

		it('return true for a valid argument (xs:boolean+)', function () {
			var argumentSequence1 = new Sequence([new BooleanValue(true)]),
				argumentSequence2 = new Sequence([new BooleanValue(true), new BooleanValue(true)]);
			chai.expect(isValidArgument('xs:boolean+', argumentSequence1)).to.equal(true);
			chai.expect(isValidArgument('xs:boolean+', argumentSequence2)).to.equal(true);
		});

		it('return true for a valid argument (xs:boolean*)', function () {
			var argumentSequence1 = new Sequence([]),
				argumentSequence2 = new Sequence([new BooleanValue(true)]),
				argumentSequence3 = new Sequence([new BooleanValue(true), new BooleanValue(true)]);
			chai.expect(isValidArgument('xs:boolean*', argumentSequence1)).to.equal(true);
			chai.expect(isValidArgument('xs:boolean*', argumentSequence2)).to.equal(true);
			chai.expect(isValidArgument('xs:boolean*', argumentSequence3)).to.equal(true);
		});

		it('return false for an invalid argument (xs:boolean)', function () {
			var argumentSequence1 = new Sequence([]),
				argumentSequence2 = new Sequence([new BooleanValue(true), new BooleanValue(true)]);
			chai.expect(isValidArgument('xs:boolean', argumentSequence1)).to.equal(false);
			chai.expect(isValidArgument('xs:boolean', argumentSequence2)).to.equal(false);
		});

		it('return false for an invalid argument (xs:boolean?)', function () {
			var argumentSequence = new Sequence([new BooleanValue(true), new BooleanValue(true)]);
			chai.expect(isValidArgument('xs:boolean?', argumentSequence)).to.equal(false);
		});

		it('return false for an invalid argument (xs:boolean+)', function () {
			var argumentSequence = new Sequence([]);
			chai.expect(isValidArgument('xs:boolean+', argumentSequence)).to.equal(false);
		});

		it('return false for an invalid argument (wrong type)', function () {
			var argumentSequence = new Sequence([new BooleanValue(true)]);
			chai.expect(isValidArgument('xs:string', argumentSequence)).to.equal(false);
		});
	});
});
