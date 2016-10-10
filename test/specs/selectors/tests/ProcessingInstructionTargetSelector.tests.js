define([
	'fontoxml-selectors/selectors/tests/ProcessingInstructionTargetSelector'
], function (
	ProcessingInstructionTargetSelector
) {
	'use strict';

	describe('ProcessingInstructionTargetSelector.equals()', function () {
		it('returns true if compared with itself', function () {
			var processingInstructionTargetSelector1 = new ProcessingInstructionTargetSelector('PI'),
				processingInstructionTargetSelector2 = processingInstructionTargetSelector1;
			chai.expect(processingInstructionTargetSelector1.equals(processingInstructionTargetSelector2)).to.equal(true);
			chai.expect(processingInstructionTargetSelector2.equals(processingInstructionTargetSelector1)).to.equal(true);
		});

		it('it returns true if compared with an equal other ProcessingInstructionTargetSelector', function () {
			var processingInstructionTargetSelector1 = new ProcessingInstructionTargetSelector('PI'),
				processingInstructionTargetSelector2 = new ProcessingInstructionTargetSelector('PI');
			chai.expect(processingInstructionTargetSelector1.equals(processingInstructionTargetSelector2)).to.equal(true);
			chai.expect(processingInstructionTargetSelector2.equals(processingInstructionTargetSelector1)).to.equal(true);
		});

		it('it returns false if compared with an unequal other ProcessingInstructionTargetSelector', function () {
			var processingInstructionTargetSelector1 = new ProcessingInstructionTargetSelector('PI1'),
				processingInstructionTargetSelector2 = new ProcessingInstructionTargetSelector('PI2');
			chai.expect(processingInstructionTargetSelector1.equals(processingInstructionTargetSelector2)).to.equal(false);
			chai.expect(processingInstructionTargetSelector2.equals(processingInstructionTargetSelector1)).to.equal(false);
		});
	});
});
