import { castToType, promoteToType } from 'fontoxpath/selectors/dataTypes/conversionHelper';
import AnyAtomicTypeValue from 'fontoxpath/selectors/dataTypes/AnyAtomicTypeValue';
import StringValue from 'fontoxpath/selectors/dataTypes/StringValue';
import IntegerValue from 'fontoxpath/selectors/dataTypes/IntegerValue';
import BooleanValue from 'fontoxpath/selectors/dataTypes/BooleanValue';
import DecimalValue from 'fontoxpath/selectors/dataTypes/DecimalValue';
import DoubleValue from 'fontoxpath/selectors/dataTypes/DoubleValue';
import FloatValue from 'fontoxpath/selectors/dataTypes/FloatValue';
import QNameValue from 'fontoxpath/selectors/dataTypes/QNameValue';

describe('casting', () => {
	describe('xs:boolean', () => {
		it('casts "true" to true', () => {
			const booleanValue = castToType(new StringValue('true'), 'xs:boolean');
			chai.assert.isTrue(booleanValue.value);
		});

		it('casts "false" to false', () => {
			const booleanValue = castToType(new StringValue('false'), 'xs:boolean');
			chai.assert.isFalse(booleanValue.value);
		});

		it('casts "1" to true', () => {
			const booleanValue = castToType(new StringValue('1'), 'xs:boolean');
			chai.assert.isTrue(booleanValue.value);
		});

		it('casts "0" to false', () => {
			const booleanValue = castToType(new StringValue('0'), 'xs:boolean');
			chai.assert.isFalse(booleanValue.value);
		});

		it('throws when given an invalid value', () => {
			const stringValue = new StringValue('invalid');
			chai.assert.throws(() => castToType(stringValue, 'xs:boolean'), 'XPTY0004');
		});
	});

	describe('xs:decimal', () => {
		it('casts the given string to a DecimalValue', () => {
			const numericValue = new DecimalValue(123);
			chai.assert.deepEqual(castToType(new StringValue('123'), 'xs:decimal'), numericValue);
		});
	});

	describe('xs:double', () => {
		it('casts the given string to a DoubleValue', () => {
			const numericValue = new DoubleValue(123);
			chai.assert.deepEqual(castToType(new StringValue('123'), 'xs:double'), numericValue);
		});
	});

	describe('xs:float', () => {
		it('casts the given string to a FloatValue', () => {
			const numericValue = new FloatValue(123);
			chai.assert.deepEqual(castToType(new StringValue('123'), 'xs:float'), numericValue);
		});
	});

	describe('xs:integer', () => {
		it('casts the given string to a IntegerValue', () => {
			const numericValue = new IntegerValue(123);
			chai.assert.deepEqual(castToType(new StringValue('123'), 'xs:integer'), numericValue);
		});
	});

	describe('xs:string', () => {
		it('casts the given string to a StringValue', () => {
			const numericValue = new StringValue('123');
			chai.assert.deepEqual(castToType(new StringValue('123'), 'xs:string'), numericValue);
		});
	});
});
