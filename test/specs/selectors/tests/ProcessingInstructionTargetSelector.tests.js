import ProcessingInstructionTargetSelector from 'fontoxml-selectors/selectors/tests/ProcessingInstructionTargetSelector';

describe('ProcessingInstructionTargetSelector.equals()', () => {
	it('returns true if compared with itself', () => {
		const processingInstructionTargetSelector1 = new ProcessingInstructionTargetSelector('PI'),
			processingInstructionTargetSelector2 = processingInstructionTargetSelector1;
		chai.expect(processingInstructionTargetSelector1.equals(processingInstructionTargetSelector2)).to.equal(true);
		chai.expect(processingInstructionTargetSelector2.equals(processingInstructionTargetSelector1)).to.equal(true);
	});

	it('it returns true if compared with an equal other ProcessingInstructionTargetSelector', () => {
		const processingInstructionTargetSelector1 = new ProcessingInstructionTargetSelector('PI'),
			processingInstructionTargetSelector2 = new ProcessingInstructionTargetSelector('PI');
		chai.expect(processingInstructionTargetSelector1.equals(processingInstructionTargetSelector2)).to.equal(true);
		chai.expect(processingInstructionTargetSelector2.equals(processingInstructionTargetSelector1)).to.equal(true);
	});

	it('it returns false if compared with an unequal other ProcessingInstructionTargetSelector', () => {
		const processingInstructionTargetSelector1 = new ProcessingInstructionTargetSelector('PI1'),
			processingInstructionTargetSelector2 = new ProcessingInstructionTargetSelector('PI2');
		chai.expect(processingInstructionTargetSelector1.equals(processingInstructionTargetSelector2)).to.equal(false);
		chai.expect(processingInstructionTargetSelector2.equals(processingInstructionTargetSelector1)).to.equal(false);
	});
});
