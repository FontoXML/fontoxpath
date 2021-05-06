import * as chai from 'chai';
import * as slimdom from 'slimdom';

import { BaseType, createTypedValueFactory, evaluateXPathToBoolean } from 'fontoxpath';
import { SequenceType } from 'fontoxpath/expressions/dataTypes/Value';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('createTypedValueFactory', () => {
	it('creates an xs:integer value', () => {
		const typedValueFactory = createTypedValueFactory({
			kind: BaseType.XSINTEGER,
			seqType: SequenceType.EXACTLY_ONE,
		});

		const typedValue = typedValueFactory(123, documentNode);

		chai.assert.equal(
			evaluateXPathToBoolean('$value instance of xs:integer', null, null, {
				value: typedValue,
			}),
			true
		);
	});

	it('creates an xs:integer value from a string', () => {
		const typedValueFactory = createTypedValueFactory({
			kind: BaseType.XSINTEGER,
			seqType: SequenceType.EXACTLY_ONE,
		});

		const typedValue = typedValueFactory('123', documentNode);

		chai.assert.equal(
			evaluateXPathToBoolean('$value instance of xs:integer', null, null, {
				value: typedValue,
			}),
			true
		);
	});

	it('throws when expecting a Date value but reiving a boolean', () => {
		const typedValueFactory = createTypedValueFactory({
			kind: BaseType.XSDATE,
			seqType: SequenceType.EXACTLY_ONE,
		});

		chai.assert.throws(
			() => typedValueFactory(true, documentNode),
			`The JavaScript value true with type boolean is not a valid type to be converted to an XPath xs:date.`
		);
	});

	it('throws when expecting a node() value but reiving a boolean', () => {
		const typedValueFactory = createTypedValueFactory({
			kind: BaseType.NODE,
			seqType: SequenceType.EXACTLY_ONE,
		});

		chai.assert.throws(
			() => typedValueFactory(true, documentNode),
			`The JavaScript value true with type boolean is not a valid type to be converted to an XPath node().`
		);
	});

	it('throws when expecting a number value but reiving a boolean', () => {
		const typedValueFactory = createTypedValueFactory({
			kind: BaseType.XSINTEGER,
			seqType: SequenceType.EXACTLY_ONE,
		});

		chai.assert.throws(
			() => typedValueFactory(true, documentNode),
			`Cannot convert JavaScript value 'true' to the XPath type xs:integer since it is not valid.`
		);
	});

	it('throws when expecting a number value but reiving a string', () => {
		const typedValueFactory = createTypedValueFactory({
			kind: BaseType.XSINTEGER,
			seqType: SequenceType.EXACTLY_ONE,
		});

		chai.assert.throws(
			() => typedValueFactory('foo', documentNode),
			`Cannot convert JavaScript value 'foo' to the XPath type xs:integer since it is not valid.`
		);
	});

	it('throws when expecting a number value but reiving null', () => {
		const typedValueFactory = createTypedValueFactory({
			kind: BaseType.XSINTEGER,
			seqType: SequenceType.EXACTLY_ONE,
		});

		chai.assert.throws(
			() => typedValueFactory(null, documentNode),
			`The JavaScript value null should be an single entry if it is to be converted to xs:integer.`
		);
	});

	it('throws when expecting an array', () => {
		const typedValueFactory = createTypedValueFactory({
			kind: BaseType.XSINTEGER,
			seqType: SequenceType.ZERO_OR_MORE,
		});

		chai.assert.throws(
			() => typedValueFactory(123, documentNode),
			`The JavaScript value 123 should be an array if it is to be converted to xs:integer*.`
		);
	});

	it('throws when trying to convert a Symbol', () => {
		const typedValueFactory = createTypedValueFactory({
			kind: BaseType.ITEM,
			seqType: SequenceType.EXACTLY_ONE,
		});

		chai.assert.throws(
			() => typedValueFactory((Symbol('foo') as unknown) as string, documentNode),
			'Value Symbol(foo) of type "symbol" is not adaptable to an XPath value.'
		);
	});
});
