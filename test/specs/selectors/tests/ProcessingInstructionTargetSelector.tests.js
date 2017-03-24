import ProcessingInstructionTargetSelector from 'fontoxpath/selectors/tests/ProcessingInstructionTargetSelector';

describe('ProcessingInstructionTargetSelector.equals()', () => {
	it('returns true if compared with itself', () => {
		const processingInstructionTargetSelector1 = new ProcessingInstructionTargetSelector('PI'),
			processingInstructionTargetSelector2 = processingInstructionTargetSelector1;
		chai.assert.isTrue(processingInstructionTargetSelector1.equals(processingInstructionTargetSelector2));
		chai.assert.isTrue(processingInstructionTargetSelector2.equals(processingInstructionTargetSelector1));
	});

	it('it returns true if compared with an equal other ProcessingInstructionTargetSelector', () => {
		const processingInstructionTargetSelector1 = new ProcessingInstructionTargetSelector('PI'),
			processingInstructionTargetSelector2 = new ProcessingInstructionTargetSelector('PI');
		chai.assert.isTrue(processingInstructionTargetSelector1.equals(processingInstructionTargetSelector2));
		chai.assert.isTrue(processingInstructionTargetSelector2.equals(processingInstructionTargetSelector1));
	});

	it('it returns false if compared with an unequal other ProcessingInstructionTargetSelector', () => {
		const processingInstructionTargetSelector1 = new ProcessingInstructionTargetSelector('PI1'),
			processingInstructionTargetSelector2 = new ProcessingInstructionTargetSelector('PI2');
		chai.assert.isFalse(processingInstructionTargetSelector1.equals(processingInstructionTargetSelector2));
		chai.assert.isFalse(processingInstructionTargetSelector2.equals(processingInstructionTargetSelector1));
	});
});
