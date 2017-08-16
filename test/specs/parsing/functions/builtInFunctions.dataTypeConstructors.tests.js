import * as slimdom from 'slimdom';

import {
	evaluateXPathToBoolean
} from 'fontoxpath';
import evaluateXPathToAsyncSingleton from 'test-helpers/evaluateXPathToAsyncSingleton';
let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('Data type constructors', () => {
	it('xs:anySimpleType()',
		() => chai.assert.throws(() => evaluateXPathToBoolean('xs:anySimpleType("test") instance of xs:anySimpleType+', documentNode)));
	it('xs:anyAtomicType()',
		() => chai.assert.throws(() => evaluateXPathToBoolean('xs:anyAtomicType("test") instance of xs:anyAtomicType+', documentNode)));
	it('xs:anyURI()',
		() => chai.assert.isTrue(evaluateXPathToBoolean('xs:anyURI("test") instance of xs:anyURI+', documentNode)));
	it('xs:base64Binary()',
		() => chai.assert.isTrue(evaluateXPathToBoolean('xs:base64Binary("c29tZSBiYXNlNjQgdGV4dA==") instance of xs:base64Binary+', documentNode)));
	it('xs:boolean()',
		() => chai.assert.isTrue(evaluateXPathToBoolean('xs:boolean("true") instance of xs:boolean+', documentNode)));
	it('xs:date()',
		() => chai.assert.isTrue(evaluateXPathToBoolean('xs:date("2008-10-10") instance of xs:date+', documentNode)));
	it('xs:dateTime()',
		() => chai.assert.isTrue(evaluateXPathToBoolean('xs:dateTime("2008-10-10T10:10:10") instance of xs:dateTime+', documentNode)));
	it('xs:dateTimeStamp()',
		() => chai.assert.isTrue(evaluateXPathToBoolean('xs:dateTimeStamp("2008-10-10T10:10:10+10:10") instance of xs:dateTimeStamp+', documentNode)));
	it('xs:decimal()',
		() => chai.assert.isTrue(evaluateXPathToBoolean('xs:decimal("10") instance of xs:decimal+', documentNode)));
	it('xs:integer()',
		() => chai.assert.isTrue(evaluateXPathToBoolean('xs:integer("10") instance of xs:integer+', documentNode)));
	it('xs:long()',
		() => chai.assert.isTrue(evaluateXPathToBoolean('xs:long("10") instance of xs:long+', documentNode)));
	it('xs:int()',
		() => chai.assert.isTrue(evaluateXPathToBoolean('xs:int("10") instance of xs:int+', documentNode)));
	it('xs:short()',
		() => chai.assert.isTrue(evaluateXPathToBoolean('xs:short("10") instance of xs:short+', documentNode)));
	it('xs:byte()',
		() => chai.assert.isTrue(evaluateXPathToBoolean('xs:byte("10") instance of xs:byte+', documentNode)));
	it('xs:nonNegativeInteger()',
		() => chai.assert.isTrue(evaluateXPathToBoolean('xs:nonNegativeInteger("10") instance of xs:nonNegativeInteger+', documentNode)));
	it('xs:positiveInteger()',
		() => chai.assert.isTrue(evaluateXPathToBoolean('xs:positiveInteger("10") instance of xs:positiveInteger+', documentNode)));
	it('xs:unsignedLong()',
		() => chai.assert.isTrue(evaluateXPathToBoolean('xs:unsignedLong("10") instance of xs:unsignedLong+', documentNode)));
	it('xs:unsignedInt()',
		() => chai.assert.isTrue(evaluateXPathToBoolean('xs:unsignedInt("10") instance of xs:unsignedInt+', documentNode)));
	it('xs:unsigendShort()',
		() => chai.assert.isTrue(evaluateXPathToBoolean('xs:unsignedShort("10") instance of xs:unsignedShort+', documentNode)));
	it('xs:unsignedByte()',
		() => chai.assert.isTrue(evaluateXPathToBoolean('xs:unsignedByte("10") instance of xs:unsignedByte+', documentNode)));
	it('xs:nonPositiveInteger()',
		() => chai.assert.isTrue(evaluateXPathToBoolean('xs:nonPositiveInteger("-10") instance of xs:nonPositiveInteger+', documentNode)));
	it('xs:negativeInteger()',
		() => chai.assert.isTrue(evaluateXPathToBoolean('xs:negativeInteger("-10") instance of xs:negativeInteger+', documentNode)));
	it('xs:double()',
		() => chai.assert.isTrue(evaluateXPathToBoolean('xs:double("10") instance of xs:double+', documentNode)));
	it('xs:duration()',
		() => chai.assert.isTrue(evaluateXPathToBoolean('xs:duration("P10D") instance of xs:duration+', documentNode)));
	it('xs:dayTimeDuration()',
		() => chai.assert.isTrue(evaluateXPathToBoolean('xs:dayTimeDuration("P10D") instance of xs:dayTimeDuration+', documentNode)));
	it('xs:yearMonthDuration()',
		() => chai.assert.isTrue(evaluateXPathToBoolean('xs:yearMonthDuration("P10Y") instance of xs:yearMonthDuration+', documentNode)));
	it('xs:float()',
		() => chai.assert.isTrue(evaluateXPathToBoolean('xs:float("10") instance of xs:float+', documentNode)));
	it('xs:gDay()',
		() => chai.assert.isTrue(evaluateXPathToBoolean('xs:gDay("---10") instance of xs:gDay+', documentNode)));
	it('xs:gMonth()',
		() => chai.assert.isTrue(evaluateXPathToBoolean('xs:gMonth("--10") instance of xs:gMonth+', documentNode)));
	it('xs:gMonthDay()',
		() => chai.assert.isTrue(evaluateXPathToBoolean('xs:gMonthDay("--10-10") instance of xs:gMonthDay+', documentNode)));
	it('xs:gYear()',
		() => chai.assert.isTrue(evaluateXPathToBoolean('xs:gYear("1900") instance of xs:gYear+', documentNode)));
	it('xs:gYearMonth()',
		() => chai.assert.isTrue(evaluateXPathToBoolean('xs:gYearMonth("1990-12") instance of xs:gYearMonth+', documentNode)));
	it('xs:hexBinary()',
		() => chai.assert.isTrue(evaluateXPathToBoolean('xs:hexBinary("1234567890ABCDEF") instance of xs:hexBinary+', documentNode)));
	it('xs:NOTATION()',
		() => chai.assert.throws(() => evaluateXPathToBoolean('xs:NOTATION("abc") instance of xs:NOTATION+', documentNode)));

	describe('QName', () => {
		describe('xs:QName', () => {
			it('xs:QName() with prefix',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:QName("xs:abc") instance of xs:QName', documentNode)));
			it('xs:QName() with invalid string value',
				() => chai.assert.throws(() => evaluateXPathToBoolean('xs:QName("1abc") instance of xs:QName', documentNode), 'FORG0001'));
			it('xs:QName() with prefix',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:QName("xs:abc") instance of xs:QName', documentNode)));
			it('xs:QName() with unknown prefix',
				() => chai.assert.throws(() => evaluateXPathToBoolean('xs:QName("abc:abc") instance of xs:QName', documentNode)), 'FORG0001');
			it('xs:QName() without prefix',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:QName("abc") instance of xs:QName', documentNode, null, null, { namespaceResolver: () => 'http://example.com/ns' })));
		});

		describe('fn:QName', () => {
			// fn:QName is the usable constructor
			it('fn:QName() with prefix',
				() => chai.assert.isTrue(evaluateXPathToBoolean('fn:QName("http://example.com/ns", "xs:abc") instance of xs:QName', documentNode)));
			it('fn:QName() with invalid string value',
				() => chai.assert.throws(() => evaluateXPathToBoolean('fn:QName("http://example.com/ns", "1abc")', documentNode), 'FOCA0002'));
			it('fn:QName() with absent namespaceURI',
				() => chai.assert.throws(() => evaluateXPathToBoolean('fn:QName((), "abc:abc")', documentNode), 'FOCA0002'));
			it('accepts async params', async () => {
				chai.assert.isTrue(await evaluateXPathToAsyncSingleton('fn:QName("http://example.com/ns" => fontoxpath:sleep(1), "xs:abc" => fontoxpath:sleep(1)) instance of xs:QName', documentNode));
			});
		});

	});

	it('xs:string()',
		() => chai.assert.isTrue(evaluateXPathToBoolean('xs:string("abc") instance of xs:string+', documentNode)));
	it('xs:normalizedString()',
		() => chai.assert.isTrue(evaluateXPathToBoolean('xs:normalizedString("abc") instance of xs:normalizedString+', documentNode)));
	it('xs:token()',
		() => chai.assert.isTrue(evaluateXPathToBoolean('xs:token("abc") instance of xs:token+', documentNode)));
	it('xs:language()',
		() => chai.assert.isTrue(evaluateXPathToBoolean('xs:language("abc") instance of xs:language+', documentNode)));
	it('xs:Name()',
		() => chai.assert.isTrue(evaluateXPathToBoolean('xs:Name("abc") instance of xs:Name+', documentNode)));
	it('xs:NCName()',
		() => chai.assert.isTrue(evaluateXPathToBoolean('xs:NCName("abc") instance of xs:NCName+', documentNode)));
	it('xs:ENTITY()',
		() => chai.assert.isTrue(evaluateXPathToBoolean('xs:ENTITY("abc") instance of xs:ENTITY+', documentNode)));
	it('xs:ID()',
		() => chai.assert.isTrue(evaluateXPathToBoolean('xs:ID("abc") instance of xs:ID+', documentNode)));
	it('xs:IDREF()',
		() => chai.assert.isTrue(evaluateXPathToBoolean('xs:IDREF("abc") instance of xs:IDREF+', documentNode)));
	it('xs:NMTOKEN()',
		() => chai.assert.isTrue(evaluateXPathToBoolean('xs:NMTOKEN("abc") instance of xs:NMTOKEN+', documentNode)));
	it('xs:time()',
		() => chai.assert.isTrue(evaluateXPathToBoolean('xs:time("10:10:10.1+10:10") instance of xs:time+', documentNode)));
	it.skip('xs:ENTITIES()',
			() => chai.assert.isTrue(evaluateXPathToBoolean('', documentNode)));
	it.skip('xs:IDREFS()',
			() => chai.assert.isTrue(evaluateXPathToBoolean('', documentNode)));
	it.skip('xs:NMTOKENS()',
			() => chai.assert.isTrue(evaluateXPathToBoolean('', documentNode)));
});
