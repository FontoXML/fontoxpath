import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

import {
	evaluateXPathToBoolean
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('KindTest', () => {
	it('can select any element -> element()', () => {
		jsonMlMapper.parse([
			'someOtherParentElement',
			['someElement']
		], documentNode);
		chai.assert.isTrue(evaluateXPathToBoolean('self::element()', documentNode.documentElement.firstChild));
	});

	it('can select any element -> element(name)', () => {
		jsonMlMapper.parse([
			'someOtherParentElement',
			['someElement']
		], documentNode);
		chai.assert.isTrue(evaluateXPathToBoolean('self::element(someElement)', documentNode.documentElement.firstChild));
	});

	it('can select any element -> element(prefix:name)', () => {
		const browserDocument = new DOMParser().parseFromString('<xml xmlns:prefix="http://example.com/ns"><prefix:element/></xml>', 'text/xml');
		chai.assert.isTrue(evaluateXPathToBoolean('self::element(prefix:element)', browserDocument.documentElement.firstChild));
	});

	it('can select any text node -> text()', () => {
		jsonMlMapper.parse([
			'someOtherParentElement',
			'Some text'
		], documentNode);
		chai.assert.isTrue(evaluateXPathToBoolean('self::text()', documentNode.documentElement.firstChild));
	});

	it('regards CDATA nodes as text nodes', () => {
		const browserDocument = new DOMParser().parseFromString('<xml><![CDATA[Some CData]]></xml>', 'text/xml');
		chai.assert.isTrue(evaluateXPathToBoolean('child::text()', browserDocument.documentElement));
	});

	it('can select any PI -> processing-instruction()', () => {
		jsonMlMapper.parse([
			'someOtherParentElement',
			['?someElement']
		], documentNode);
		chai.assert.isTrue(evaluateXPathToBoolean('self::processing-instruction()', documentNode.documentElement.firstChild));
	});

	it('can select any comment -> comment()', () => {
		jsonMlMapper.parse([
			'someOtherParentElement',
			['!', 'some comment']
		], documentNode);
		chai.assert.isTrue(evaluateXPathToBoolean('self::comment()', documentNode.documentElement.firstChild));
	});

	it('can select any attribute -> attribute()', () => {
		jsonMlMapper.parse([
			'someOtherParentElement',
			{attr: 'value'}
		], documentNode);
		chai.assert.isTrue(evaluateXPathToBoolean('@attribute()', documentNode.documentElement));
	});
	it('can select any attribute -> attribute(name)', () => {
		jsonMlMapper.parse([
			'someOtherParentElement',
			{attr: 'value'}
		], documentNode);
		chai.assert.isTrue(evaluateXPathToBoolean('@attribute(attr)', documentNode.documentElement));
	});
	it('can return when directly fed an attribute (skipping any paths)', () => {
		jsonMlMapper.parse([
			'someOtherParentElement',
			{attr: 'value'}
		], documentNode);
		chai.assert.isTrue(evaluateXPathToBoolean('self::attribute()', documentNode.documentElement.getAttributeNode('attr')));
	});
});
