import * as chai from 'chai';
import { BaseType } from 'fontoxpath';
import DomFacade from 'fontoxpath/domFacade/DomFacade';
import { adaptJavaScriptValueToSequence } from 'fontoxpath/expressions/adaptJavaScriptValueToXPathValue';
import DateTime from 'fontoxpath/expressions/dataTypes/valueTypes/DateTime';
import * as slimdom from 'slimdom';
import { domFacade as adaptingDomFacade } from '../../../src';

describe('adaptJavaScriptValueToSequence', () => {
	it('turns numbers into integers', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(null, 1, { kind: BaseType.XSINTEGER });
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type.kind === BaseType.XSINTEGER, 'is an integer');
		chai.assert.equal(xpathSequence.first().value, 1, 'is 1');
	});

	// TODO: This is impossible right?
	// it('does not support unknown types', () => {
	// 	chai.assert.throws(
	// 		() => adaptJavaScriptValueToSequence(null, 1, 'fonto:theBestType'),
	// 		' can not be adapted to equivalent XPath values'
	// 	);
	// });

	it('turns numbers into doubles', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(null, 1.0, {
			kind: BaseType.XSDOUBLE,
		});
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type.kind === BaseType.XSDOUBLE, 'is a double');
		chai.assert.equal(xpathSequence.first().value, 1.0, 'is 1.0');
	});

	it('turns nodes into nodes', () => {
		const domFacade = new DomFacade(adaptingDomFacade);
		const xpathSequence = adaptJavaScriptValueToSequence(domFacade, new slimdom.Document());
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type.kind === BaseType.DOCUMENTNODE, 'is a document');
	});

	it('turns numbers into decimals', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(null, 1.0, {
			kind: BaseType.XSDECIMAL,
		});
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type.kind === BaseType.XSDECIMAL, 'is a decimal');
		chai.assert.equal(xpathSequence.first().value, 1.0, 'is 1.0');
	});

	it('turns numbers into floats', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(null, 1.0, { kind: BaseType.XSFLOAT });
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type.kind === BaseType.XSFLOAT, 'is a float');
		chai.assert.equal(xpathSequence.first().value, 1.0, 'is 1.0');
	});

	it('turns booleans into booleans', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(null, false, {
			kind: BaseType.XSBOOLEAN,
		});
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type.kind === BaseType.XSBOOLEAN, 'is a boolean');
		chai.assert.equal(xpathSequence.first().value, false, 'is false');
	});

	it('turns strings into xs:string?', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(null, 'a', {
			kind: BaseType.NULLABLE,
			item: { kind: BaseType.XSSTRING },
		});
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type.kind === BaseType.XSSTRING, 'is a string');
		chai.assert.equal(xpathSequence.first().value, 'a', 'is the same string');
	});

	it('turns strings into xs:string+', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(null, ['a', 'b', 'c'], {
			kind: BaseType.SOME,
			item: { kind: BaseType.XSSTRING },
		});
		chai.assert.equal(xpathSequence.getLength(), 3, 'is a sequence with length 3');
		const values = xpathSequence.getAllValues();
		chai.assert(xpathSequence.first().type.kind === BaseType.XSSTRING, 'first is a string');
		chai.assert(values[1].type.kind === BaseType.XSSTRING, 'second is a string');
		chai.assert(values[2].type.kind === BaseType.XSSTRING, 'third is a string');
		chai.assert.equal(xpathSequence.first().value, 'a', 'is a');
		chai.assert.equal(values[1].value, 'b', 'is b');
		chai.assert.equal(values[2].value, 'c', 'is c');
	});

	it('turns strings into xs:string*', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(null, ['a', 'b', 'c'], {
			kind: BaseType.ANY,
			item: { kind: BaseType.XSSTRING },
		});
		chai.assert.equal(xpathSequence.getLength(), 3, 'is a sequence with length 3');
		const values = xpathSequence.getAllValues();
		chai.assert(xpathSequence.first().type.kind === BaseType.XSSTRING, 'first is a string');
		chai.assert(values[1].type.kind === BaseType.XSSTRING, 'second is a string');
		chai.assert(values[2].type.kind === BaseType.XSSTRING, 'third is a string');
		chai.assert.equal(xpathSequence.first().value, 'a', 'is a');
		chai.assert.equal(values[1].value, 'b', 'is b');
		chai.assert.equal(values[2].value, 'c', 'is c');
	});

	it('turns null into string? (empty sequence)', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(null, null, {
			kind: BaseType.NULLABLE,
			item: { kind: BaseType.ITEM },
		});
		chai.assert(xpathSequence.isEmpty(), 'is a singleton sequence');
	});

	it('turns date into xs:date', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(
			null,
			new Date(Date.UTC(2018, 5, 22, 9, 10, 20)),
			{
				kind: BaseType.XSDATE,
			}
		);
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type.kind === BaseType.XSDATE, 'is a date');
		chai.assert.deepEqual(
			xpathSequence.first().value,
			DateTime.fromString('2018-06-22Z'),
			'is 22nd June 2018'
		);
	});

	it('turns date into xs:time', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(
			null,
			new Date(Date.UTC(2018, 5, 22, 9, 10, 20)),
			{ kind: BaseType.ITEM }
		);
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type.kind === BaseType.XSTIME, 'is a time');
		chai.assert.deepEqual(
			xpathSequence.first().value,
			DateTime.fromString('09:10:20Z'),
			'is 09:10:20'
		);
	});

	it('turns date into xs:dateTime', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(
			null,
			new Date(Date.UTC(2018, 5, 22, 9, 10, 20)),
			{ kind: BaseType.XSDATETIME }
		);
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type.kind === BaseType.XSDATETIME, 'is a dateTime');
		chai.assert.deepEqual(
			xpathSequence.first().value,
			DateTime.fromString('2018-06-22T09:10:20Z'),
			'is 22nd June 2018 09:10:20'
		);
	});

	it('turns date into xs:gYearMonth', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(
			null,
			new Date(Date.UTC(2018, 5, 22, 9, 10, 20)),
			{ kind: BaseType.XSGYEARMONTH }
		);
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type.kind === BaseType.XSGYEARMONTH, 'is a gYearMonth');
		chai.assert.deepEqual(
			xpathSequence.first().value,
			DateTime.fromString('2018-06Z'),
			'is June 2018'
		);
	});

	it('turns date into xs:gYear', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(
			null,
			new Date(Date.UTC(2018, 5, 22, 9, 10, 20)),
			{ kind: BaseType.XSGYEAR }
		);
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type.kind === BaseType.XSGYEAR, 'is a gYear');
		chai.assert.deepEqual(xpathSequence.first().value, DateTime.fromString('2018Z'), 'is 2018');
	});

	it('turns date into xs:gMonthDay', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(
			null,
			new Date(Date.UTC(2018, 5, 22, 9, 10, 20)),
			{ kind: BaseType.XSGMONTHDAY }
		);
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type.kind === BaseType.XSGMONTHDAY, 'is a gMonthDay');
		chai.assert.deepEqual(
			xpathSequence.first().value,
			DateTime.fromString('-06-22Z'),
			'is 22nd June'
		);
	});

	it('turns date into xs:gMonth', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(
			null,
			new Date(Date.UTC(2018, 5, 22, 9, 10, 20)),
			{ kind: BaseType.XSGMONTH }
		);
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type.kind === BaseType.XSGMONTH, 'is a gMonth');
		chai.assert.deepEqual(xpathSequence.first().value, DateTime.fromString('-06Z'), 'is June');
	});

	it('turns date into xs:gDay', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(
			null,
			new Date(Date.UTC(2018, 5, 22, 9, 10, 20)),
			{ kind: BaseType.XSGDAY }
		);
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type.kind === BaseType.XSGDAY, 'is a gDay');
		chai.assert.deepEqual(
			xpathSequence.first().value,
			DateTime.fromString('---22Z'),
			'is 22nd'
		);
	});

	describe('converting to item()', () => {
		it('can automatically convert numbers', () => {
			const xpathSequence = adaptJavaScriptValueToSequence(null, 1.0, {
				kind: BaseType.ITEM,
			});
			chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
			chai.assert(xpathSequence.first().type.kind === BaseType.XSDOUBLE, 'is a double');
			chai.assert.equal(xpathSequence.first().value, 1.0, 'is 1.0');
		});

		it('can automatically convert strings', () => {
			const xpathSequence = adaptJavaScriptValueToSequence(null, 'a', {
				kind: BaseType.ITEM,
			});
			chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
			chai.assert(xpathSequence.first().type.kind === BaseType.XSSTRING, 'is a string');
			chai.assert.equal(xpathSequence.first().value, 'a', 'is "a"');
		});

		it('can automatically convert booleans', () => {
			const xpathSequence = adaptJavaScriptValueToSequence(null, true, {
				kind: BaseType.ITEM,
			});
			chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
			chai.assert(xpathSequence.first().type.kind === BaseType.XSBOOLEAN, 'is a boolean');
			chai.assert.equal(xpathSequence.first().value, true, 'is true');
		});

		it('can automatically convert objects', () => {
			const xpathSequence = adaptJavaScriptValueToSequence(null, {}, { kind: BaseType.ITEM });
			chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
			chai.assert(xpathSequence.first().type.kind === BaseType.MAP, 'is a map');
		});

		it('can automatically convert null to the empty sequence', () => {
			const xpathSequence = adaptJavaScriptValueToSequence(null, null);
			chai.assert(xpathSequence.isEmpty(), 'is the empty sequence');
		});

		it('can automatically convert arrays', () => {
			const xpathSequence = adaptJavaScriptValueToSequence(null, [], { kind: BaseType.ITEM });
			chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
			chai.assert(xpathSequence.first().type.kind === BaseType.ARRAY, 'is an array');
		});
	});
});
