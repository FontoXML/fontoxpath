import * as chai from 'chai';
import DomFacade from 'fontoxpath/domFacade/DomFacade';
import { adaptJavaScriptValueToSequence } from 'fontoxpath/expressions/adaptJavaScriptValueToXPathValue';
import DateTime from 'fontoxpath/expressions/dataTypes/valueTypes/DateTime';
import * as slimdom from 'slimdom';
import { domFacade as adaptingDomFacade } from '../../../src';

describe('adaptJavaScriptValueToSequence', () => {
	it('turns numbers into integers', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(null, 1, 'xs:integer');
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type === 'xs:integer', 'is an integer');
		chai.assert.equal(xpathSequence.first().value, 1, 'is 1');
	});

	it('does not support unknown types', () => {
		chai.assert.throws(
			() => adaptJavaScriptValueToSequence(null, 1, 'fonto:theBestType'),
			' can not be adapted to equivalent XPath values'
		);
	});

	it('turns numbers into doubles', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(null, 1.0, 'xs:double');
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type === 'xs:double', 'is a double');
		chai.assert.equal(xpathSequence.first().value, 1.0, 'is 1.0');
	});

	it('turns nodes into nodes', () => {
		const domFacade = new DomFacade(adaptingDomFacade);
		const xpathSequence = adaptJavaScriptValueToSequence(domFacade, new slimdom.Document());
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type === 'document()', 'is a document');
	});

	it('turns numbers into decimals', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(null, 1.0, 'xs:decimal');
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type === 'xs:decimal', 'is a decimal');
		chai.assert.equal(xpathSequence.first().value, 1.0, 'is 1.0');
	});

	it('turns numbers into floats', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(null, 1.0, 'xs:float');
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type === 'xs:float', 'is a float');
		chai.assert.equal(xpathSequence.first().value, 1.0, 'is 1.0');
	});

	it('turns booleans into booleans', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(null, false, 'xs:boolean');
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type === 'xs:boolean', 'is a boolean');
		chai.assert.equal(xpathSequence.first().value, false, 'is false');
	});

	it('turns strings into xs:string?', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(null, 'a', 'xs:string?');
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type === 'xs:string', 'is a string');
		chai.assert.equal(xpathSequence.first().value, 'a', 'is the same string');
	});

	it('turns strings into xs:string+', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(null, ['a', 'b', 'c'], 'xs:string+');
		chai.assert.equal(xpathSequence.tryGetLength().value, 3, 'is a sequence with length 3');
		const values = xpathSequence.getAllValues();
		chai.assert(xpathSequence.first().type === 'xs:string', 'first is a string');
		chai.assert(values[1].type === 'xs:string', 'second is a string');
		chai.assert(values[2].type === 'xs:string', 'third is a string');
		chai.assert.equal(xpathSequence.first().value, 'a', 'is a');
		chai.assert.equal(values[1].value, 'b', 'is b');
		chai.assert.equal(values[2].value, 'c', 'is c');
	});

	it('turns strings into xs:string*', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(null, ['a', 'b', 'c'], 'xs:string*');
		chai.assert.equal(xpathSequence.tryGetLength().value, 3, 'is a sequence with length 3');
		const values = xpathSequence.getAllValues();
		chai.assert(xpathSequence.first().type === 'xs:string', 'first is a string');
		chai.assert(values[1].type === 'xs:string', 'second is a string');
		chai.assert(values[2].type === 'xs:string', 'third is a string');
		chai.assert.equal(xpathSequence.first().value, 'a', 'is a');
		chai.assert.equal(values[1].value, 'b', 'is b');
		chai.assert.equal(values[2].value, 'c', 'is c');
	});

	it('turns null into string? (empty sequence)', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(null, null, 'xs:string?');
		chai.assert(xpathSequence.isEmpty(), 'is a singleton sequence');
	});

	it('turns date into xs:date', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(
			null,
			new Date(Date.UTC(2018, 5, 22, 9, 10, 20)),
			'xs:date'
		);
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type === 'xs:date', 'is a date');
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
			'xs:time'
		);
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type === 'xs:time', 'is a time');
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
			'xs:dateTime'
		);
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type === 'xs:dateTime', 'is a dateTime');
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
			'xs:gYearMonth'
		);
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type === 'xs:gYearMonth', 'is a gYearMonth');
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
			'xs:gYear'
		);
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type === 'xs:gYear', 'is a gYear');
		chai.assert.deepEqual(xpathSequence.first().value, DateTime.fromString('2018Z'), 'is 2018');
	});

	it('turns date into xs:gMonthDay', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(
			null,
			new Date(Date.UTC(2018, 5, 22, 9, 10, 20)),
			'xs:gMonthDay'
		);
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type === 'xs:gMonthDay', 'is a gMonthDay');
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
			'xs:gMonth'
		);
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type === 'xs:gMonth', 'is a gMonth');
		chai.assert.deepEqual(xpathSequence.first().value, DateTime.fromString('-06Z'), 'is June');
	});

	it('turns date into xs:gDay', () => {
		const xpathSequence = adaptJavaScriptValueToSequence(
			null,
			new Date(Date.UTC(2018, 5, 22, 9, 10, 20)),
			'xs:gDay'
		);
		chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
		chai.assert(xpathSequence.first().type === 'xs:gDay', 'is a gDay');
		chai.assert.deepEqual(
			xpathSequence.first().value,
			DateTime.fromString('---22Z'),
			'is 22nd'
		);
	});

	describe('converting to item()', () => {
		it('can automatically convert numbers', () => {
			const xpathSequence = adaptJavaScriptValueToSequence(null, 1.0, 'item()');
			chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
			chai.assert(xpathSequence.first().type === 'xs:double', 'is a double');
			chai.assert.equal(xpathSequence.first().value, 1.0, 'is 1.0');
		});

		it('can automatically convert strings', () => {
			const xpathSequence = adaptJavaScriptValueToSequence(null, 'a', 'item()');
			chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
			chai.assert(xpathSequence.first().type === 'xs:string', 'is a string');
			chai.assert.equal(xpathSequence.first().value, 'a', 'is "a"');
		});

		it('can automatically convert booleans', () => {
			const xpathSequence = adaptJavaScriptValueToSequence(null, true, 'item()');
			chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
			chai.assert(xpathSequence.first().type === 'xs:boolean', 'is a boolean');
			chai.assert.equal(xpathSequence.first().value, true, 'is true');
		});

		it('can automatically convert objects', () => {
			const xpathSequence = adaptJavaScriptValueToSequence(null, {}, 'item()');
			chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
			chai.assert(xpathSequence.first().type === 'map(*)', 'is a map');
		});

		it('can automatically convert null to the empty sequence', () => {
			const xpathSequence = adaptJavaScriptValueToSequence(null, null);
			chai.assert(xpathSequence.isEmpty(), 'is the empty sequence');
		});

		it('can automatically convert arrays', () => {
			const xpathSequence = adaptJavaScriptValueToSequence(null, [], 'item()');
			chai.assert(xpathSequence.isSingleton(), 'is a singleton sequence');
			chai.assert(xpathSequence.first().type === 'array(*)', 'is an array');
		});
	});
});
