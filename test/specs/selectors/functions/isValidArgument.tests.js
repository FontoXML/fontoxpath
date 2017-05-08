import BooleanValue from 'fontoxpath/selectors/dataTypes/BooleanValue';
import Sequence from 'fontoxpath/selectors/dataTypes/Sequence';
import { transformArgument } from 'fontoxpath/selectors/functions/argumentHelper';

describe('transformArgument()', () => {
	it('can convert a valid argument (xs:boolean)', () => {
		const argumentSequence = new Sequence([new BooleanValue(true)]);
		chai.assert.isOk(transformArgument('xs:boolean', argumentSequence));
	});

	it('can convert a valid argument (xs:boolean?)', () => {
		const argumentSequence1 = new Sequence([new BooleanValue(true)]),
			argumentSequence2 = new Sequence([]);
		chai.assert.isOk(transformArgument('xs:boolean?', argumentSequence1));
		chai.assert.isOk(transformArgument('xs:boolean?', argumentSequence2));
	});

	it('can convert a valid argument (xs:boolean+)', () => {
		const argumentSequence1 = new Sequence([new BooleanValue(true)]),
			argumentSequence2 = new Sequence([new BooleanValue(true), new BooleanValue(true)]);
		chai.assert.isOk(transformArgument('xs:boolean+', argumentSequence1));
		chai.assert.isOk(transformArgument('xs:boolean+', argumentSequence2));
	});

	it('can convert a valid argument (xs:boolean*)', () => {
		const argumentSequence1 = new Sequence([]),
			argumentSequence2 = new Sequence([new BooleanValue(true)]),
			argumentSequence3 = new Sequence([new BooleanValue(true), new BooleanValue(true)]);
		chai.assert.isOk(transformArgument('xs:boolean*', argumentSequence1));
		chai.assert.isOk(transformArgument('xs:boolean*', argumentSequence2));
		chai.assert.isOk(transformArgument('xs:boolean*', argumentSequence3));
	});

	it('can not convert an invalid argument (xs:boolean)', () => {
		const argumentSequence1 = new Sequence([]),
			argumentSequence2 = new Sequence([new BooleanValue(true), new BooleanValue(true)]);
		chai.assert.isNull(transformArgument('xs:boolean', argumentSequence1));
		chai.assert.isNull(transformArgument('xs:boolean', argumentSequence2));
	});

	it('can not convert an invalid argument (xs:boolean?)', () => {
		const argumentSequence = new Sequence([new BooleanValue(true), new BooleanValue(true)]);
		chai.assert.isNull(transformArgument('xs:boolean?', argumentSequence));
	});


	it('can not convert an invalid argument (xs:boolean+)', () => {
		const argumentSequence = new Sequence([]);
		chai.assert.isNull(transformArgument('xs:boolean+', argumentSequence));
	});

	it('can not convert an invalid argument (wrong type)', () => {
		const argumentSequence = new Sequence([new BooleanValue(true)]);
		chai.assert.throws(() => transformArgument('xs:string', argumentSequence), 'XPTY0004');
	});
});
