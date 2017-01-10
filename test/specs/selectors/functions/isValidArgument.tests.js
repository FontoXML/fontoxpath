import BooleanValue from 'fontoxpath/selectors/dataTypes/BooleanValue';
import Sequence from 'fontoxpath/selectors/dataTypes/Sequence';
import isValidArgument from 'fontoxpath/selectors/functions/isValidArgument';

describe('isValidArgument()', () => {
	it('return true for a valid argument (xs:boolean)', () => {
		const argumentSequence = new Sequence([new BooleanValue(true)]);
		chai.assert.isTrue(isValidArgument('xs:boolean', argumentSequence));
	});

	it('return true for a valid argument (xs:boolean?)', () => {
		const argumentSequence1 = new Sequence([new BooleanValue(true)]),
			argumentSequence2 = new Sequence([]);
		chai.assert.isTrue(isValidArgument('xs:boolean?', argumentSequence1));
		chai.assert.isTrue(isValidArgument('xs:boolean?', argumentSequence2));
	});

	it('return true for a valid argument (xs:boolean+)', () => {
		const argumentSequence1 = new Sequence([new BooleanValue(true)]),
			argumentSequence2 = new Sequence([new BooleanValue(true), new BooleanValue(true)]);
		chai.assert.isTrue(isValidArgument('xs:boolean+', argumentSequence1));
		chai.assert.isTrue(isValidArgument('xs:boolean+', argumentSequence2));
	});

	it('return true for a valid argument (xs:boolean*)', () => {
		const argumentSequence1 = new Sequence([]),
			argumentSequence2 = new Sequence([new BooleanValue(true)]),
			argumentSequence3 = new Sequence([new BooleanValue(true), new BooleanValue(true)]);
		chai.assert.isTrue(isValidArgument('xs:boolean*', argumentSequence1));
		chai.assert.isTrue(isValidArgument('xs:boolean*', argumentSequence2));
		chai.assert.isTrue(isValidArgument('xs:boolean*', argumentSequence3));
	});

	it('return false for an invalid argument (xs:boolean)', () => {
		const argumentSequence1 = new Sequence([]),
			argumentSequence2 = new Sequence([new BooleanValue(true), new BooleanValue(true)]);
		chai.assert.isFalse(isValidArgument('xs:boolean', argumentSequence1));
		chai.assert.isFalse(isValidArgument('xs:boolean', argumentSequence2));
	});

	it('return false for an invalid argument (xs:boolean?)', () => {
		const argumentSequence = new Sequence([new BooleanValue(true), new BooleanValue(true)]);
		chai.assert.isFalse(isValidArgument('xs:boolean?', argumentSequence));
	});

	it('return false for an invalid argument (xs:boolean+)', () => {
		const argumentSequence = new Sequence([]);
		chai.assert.isFalse(isValidArgument('xs:boolean+', argumentSequence));
	});

	it('return false for an invalid argument (wrong type)', () => {
		const argumentSequence = new Sequence([new BooleanValue(true)]);
		chai.assert.isFalse(isValidArgument('xs:string', argumentSequence));
	});
});
