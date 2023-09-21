import * as chai from 'chai';
import DomFacade from 'fontoxpath/domFacade/DomFacade';
import { adaptJavaScriptValueToSequence } from 'fontoxpath/expressions/adaptJavaScriptValueToXPathValue';
import MapValue from 'fontoxpath/expressions/dataTypes/MapValue';
import { SequenceMultiplicity, ValueType } from 'fontoxpath/expressions/dataTypes/Value';
import DateTime from 'fontoxpath/expressions/dataTypes/valueTypes/DateTime';
import * as slimdom from 'slimdom';
import { domFacade as adaptingDomFacade } from '../../../src';

describe('adaptJavaScriptValueToSequence', () => {
	it('turns numbers into integers', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(null, 1, {
			type: ValueType.XSINTEGER,
			mult: SequenceMultiplicity.EXACTLY_ONE,
		});
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type === ValueType.XSINTEGER, 'is an integer');
		chai.assert.equal(xpathSequence.first().value, 1, 'is 1');
	});

	it('turns numbers into doubles', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(null, 1.0, {
			type: ValueType.XSDOUBLE,
			mult: SequenceMultiplicity.EXACTLY_ONE,
		});
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type === ValueType.XSDOUBLE, 'is a double');
		chai.assert.equal(xpathSequence.first().value, 1.0, 'is 1.0');
	});

	it('turns nodes into nodes', () => {
		const domFacade = new DomFacade(adaptingDomFacade);
		const xpathSequence = adaptJavaScriptValueToSequence(domFacade, new slimdom.Document());
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type === ValueType.DOCUMENTNODE, 'is a document');
	});

	it('turns numbers into decimals', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(null, 1.0, {
			type: ValueType.XSDECIMAL,
			mult: SequenceMultiplicity.EXACTLY_ONE,
		});
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type === ValueType.XSDECIMAL, 'is a decimal');
		chai.assert.equal(xpathSequence.first().value, 1.0, 'is 1.0');
	});

	it('turns numbers into floats', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(null, 1.0, {
			type: ValueType.XSFLOAT,
			mult: SequenceMultiplicity.EXACTLY_ONE,
		});
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type === ValueType.XSFLOAT, 'is a float');
		chai.assert.equal(xpathSequence.first().value, 1.0, 'is 1.0');
	});

	it('turns booleans into booleans', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(null, false, {
			type: ValueType.XSBOOLEAN,
			mult: SequenceMultiplicity.EXACTLY_ONE,
		});
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type === ValueType.XSBOOLEAN, 'is a boolean');
		chai.assert.equal(xpathSequence.first().value, false, 'is false');
	});

	it('turns strings into xs:string?', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(null, 'a', {
			type: ValueType.XSSTRING,
			mult: SequenceMultiplicity.ZERO_OR_ONE,
		});
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type === ValueType.XSSTRING, 'is a string');
		chai.assert.equal(xpathSequence.first().value, 'a', 'is the same string');
	});

	it('turns strings into xs:string+', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(null, ['a', 'b', 'c'], {
			type: ValueType.XSSTRING,
			mult: SequenceMultiplicity.ONE_OR_MORE,
		});
		chai.assert.equal(xpathSequence.getLength(), 3, 'is a sequence with length 3');
		const values = xpathSequence.getAllValues();
		chai.assert(xpathSequence.first().type === ValueType.XSSTRING, 'first is a string');
		chai.assert(values[1].type === ValueType.XSSTRING, 'second is a string');
		chai.assert(values[2].type === ValueType.XSSTRING, 'third is a string');
		chai.assert.equal(xpathSequence.first().value, 'a', 'is a');
		chai.assert.equal(values[1].value, 'b', 'is b');
		chai.assert.equal(values[2].value, 'c', 'is c');
	});

	it('turns strings into xs:string*', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(null, ['a', 'b', 'c'], {
			type: ValueType.XSSTRING,
			mult: SequenceMultiplicity.ZERO_OR_MORE,
		});
		chai.assert.equal(xpathSequence.getLength(), 3, 'is a sequence with length 3');
		const values = xpathSequence.getAllValues();
		chai.assert(xpathSequence.first().type === ValueType.XSSTRING, 'first is a string');
		chai.assert(values[1].type === ValueType.XSSTRING, 'second is a string');
		chai.assert(values[2].type === ValueType.XSSTRING, 'third is a string');
		chai.assert.equal(xpathSequence.first().value, 'a', 'is a');
		chai.assert.equal(values[1].value, 'b', 'is b');
		chai.assert.equal(values[2].value, 'c', 'is c');
	});

	it('turns null into string? (empty sequence)', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(null, null, {
			type: ValueType.XSSTRING,
			mult: SequenceMultiplicity.ZERO_OR_ONE,
		});
		chai.assert(xpathSequence.isEmpty(), 'is a singleton sequence');
	});

	it('turns date into xs:date', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(
			null,
			new Date(Date.UTC(2018, 5, 22, 9, 10, 20)),
			{
				type: ValueType.XSDATE,
				mult: SequenceMultiplicity.EXACTLY_ONE,
			},
		);
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type === ValueType.XSDATE, 'is a date');
		chai.assert.deepEqual(
			xpathSequence.first().value,
			DateTime.fromString('2018-06-22Z'),
			'is 22nd June 2018',
		);
	});

	it('turns date into xs:time', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(
			null,
			new Date(Date.UTC(2018, 5, 22, 9, 10, 20)),
			{ type: ValueType.XSTIME, mult: SequenceMultiplicity.EXACTLY_ONE },
		);
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type === ValueType.XSTIME, 'is a time');
		chai.assert.deepEqual(
			xpathSequence.first().value,
			DateTime.fromString('09:10:20Z'),
			'is 09:10:20',
		);
	});

	it('turns date into xs:dateTime', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(
			null,
			new Date(Date.UTC(2018, 5, 22, 9, 10, 20)),
			{ type: ValueType.XSDATETIME, mult: SequenceMultiplicity.EXACTLY_ONE },
		);
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type === ValueType.XSDATETIME, 'is a dateTime');
		chai.assert.deepEqual(
			xpathSequence.first().value,
			DateTime.fromString('2018-06-22T09:10:20Z'),
			'is 22nd June 2018 09:10:20',
		);
	});

	it('turns date into xs:gYearMonth', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(
			null,
			new Date(Date.UTC(2018, 5, 22, 9, 10, 20)),
			{ type: ValueType.XSGYEARMONTH, mult: SequenceMultiplicity.EXACTLY_ONE },
		);
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type === ValueType.XSGYEARMONTH, 'is a gYearMonth');
		chai.assert.deepEqual(
			xpathSequence.first().value,
			DateTime.fromString('2018-06Z'),
			'is June 2018',
		);
	});

	it('turns date into xs:gYear', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(
			null,
			new Date(Date.UTC(2018, 5, 22, 9, 10, 20)),
			{ type: ValueType.XSGYEAR, mult: SequenceMultiplicity.EXACTLY_ONE },
		);
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type === ValueType.XSGYEAR, 'is a gYear');
		chai.assert.deepEqual(xpathSequence.first().value, DateTime.fromString('2018Z'), 'is 2018');
	});

	it('turns date into xs:gMonthDay', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(
			null,
			new Date(Date.UTC(2018, 5, 22, 9, 10, 20)),
			{ type: ValueType.XSGMONTHDAY, mult: SequenceMultiplicity.EXACTLY_ONE },
		);
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type === ValueType.XSGMONTHDAY, 'is a gMonthDay');
		chai.assert.deepEqual(
			xpathSequence.first().value,
			DateTime.fromString('-06-22Z'),
			'is 22nd June',
		);
	});

	it('turns date into xs:gMonth', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(
			null,
			new Date(Date.UTC(2018, 5, 22, 9, 10, 20)),
			{ type: ValueType.XSGMONTH, mult: SequenceMultiplicity.EXACTLY_ONE },
		);
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type === ValueType.XSGMONTH, 'is a gMonth');
		chai.assert.deepEqual(xpathSequence.first().value, DateTime.fromString('-06Z'), 'is June');
	});

	it('turns date into xs:gDay', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(
			null,
			new Date(Date.UTC(2018, 5, 22, 9, 10, 20)),
			{ type: ValueType.XSGDAY, mult: SequenceMultiplicity.EXACTLY_ONE },
		);
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type === ValueType.XSGDAY, 'is a gDay');
		chai.assert.deepEqual(
			xpathSequence.first().value,
			DateTime.fromString('---22Z'),
			'is 22nd',
		);
	});

	describe('converting to item()', () => {
		it('can automatically convert numbers', () => {
			const xpathSequence = adaptJavaScriptValueToSequence(null, 1.0, {
				type: ValueType.ITEM,
				mult: SequenceMultiplicity.EXACTLY_ONE,
			});
			chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
			chai.assert(xpathSequence.first().type === ValueType.XSDOUBLE, 'is a double');
			chai.assert.equal(xpathSequence.first().value, 1.0, 'is 1.0');
		});

		it('can automatically convert strings', () => {
			const xpathSequence = adaptJavaScriptValueToSequence(null, 'a', {
				type: ValueType.ITEM,
				mult: SequenceMultiplicity.EXACTLY_ONE,
			});
			chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
			chai.assert(xpathSequence.first().type === ValueType.XSSTRING, 'is a string');
			chai.assert.equal(xpathSequence.first().value, 'a', 'is "a"');
		});

		it('can automatically convert booleans', () => {
			const xpathSequence = adaptJavaScriptValueToSequence(null, true, {
				type: ValueType.ITEM,
				mult: SequenceMultiplicity.EXACTLY_ONE,
			});
			chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
			chai.assert(xpathSequence.first().type === ValueType.XSBOOLEAN, 'is a boolean');
			chai.assert.equal(xpathSequence.first().value, true, 'is true');
		});

		it('can automatically convert objects', () => {
			const xpathSequence = adaptJavaScriptValueToSequence(
				null,
				{},
				{ type: ValueType.ITEM, mult: SequenceMultiplicity.EXACTLY_ONE },
			);
			chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
			chai.assert(xpathSequence.first().type === ValueType.MAP, 'is a map');
		});

		it('can automatically convert objects when they are typed as a map', () => {
			const xpathSequence = adaptJavaScriptValueToSequence(
				null,
				{},
				{ type: ValueType.MAP, mult: SequenceMultiplicity.EXACTLY_ONE },
			);
			chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
			chai.assert(xpathSequence.first().type === ValueType.MAP, 'is a map');
		});

		it('can automatically convert objects containing dates when they are typed as a map', () => {
			const then = new Date();
			const xpathSequence = adaptJavaScriptValueToSequence(
				null,
				{ date: then },
				{ type: ValueType.MAP, mult: SequenceMultiplicity.EXACTLY_ONE },
			);
			chai.assert.isTrue(xpathSequence.isSingleton(), 'is a singleton sequence');

			chai.assert.equal(xpathSequence.first().type, ValueType.MAP, 'is a map');

			const map = xpathSequence.first() as MapValue;
			chai.assert.equal(map.keyValuePairs.length, 1, 'One key');
			chai.assert.equal(map.keyValuePairs[0].key.value, 'date', 'Key is "date"');
			const valuesForDate = map.keyValuePairs[0].value().getAllValues();
			chai.assert.equal(valuesForDate.length, 1, 'Should be one value');
			chai.assert.equal(valuesForDate[0].type, ValueType.XSDATETIME, 'Value is a date');
			const value = valuesForDate[0].value as DateTime;
			chai.assert.equal(value.toJavaScriptDate().getTime(), then.getTime());
		});

		it('can automatically convert null to the empty sequence', () => {
			const xpathSequence = adaptJavaScriptValueToSequence(null, null);
			chai.assert(xpathSequence.isEmpty(), 'is the empty sequence');
		});

		it('can automatically convert arrays', () => {
			const xpathSequence = adaptJavaScriptValueToSequence(null, [], {
				type: ValueType.ITEM,
				mult: SequenceMultiplicity.EXACTLY_ONE,
			});
			chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
			chai.assert(xpathSequence.first().type === ValueType.ARRAY, 'is an array');
		});
	});
});
