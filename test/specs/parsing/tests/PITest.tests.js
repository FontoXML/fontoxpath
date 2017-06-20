import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

import {
	evaluateXPathToBoolean
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('processing-instruction()', () => {
	it('allows processing instruction targets as literals', () => {
		jsonMlMapper.parse([
			'someOtherParentElement',
			['?someTarget', 'someData']
		], documentNode);
		chai.assert.isTrue(evaluateXPathToBoolean('self::processing-instruction("someTarget")', documentNode.documentElement.firstChild));
	});

	it('allows processing instruction tests without a target', () => {
		jsonMlMapper.parse([
			'someOtherParentElement',
			['?someTarget', 'someData']
		], documentNode);
		chai.assert.isTrue(evaluateXPathToBoolean('self::processing-instruction()', documentNode.documentElement.firstChild));
	});

	it('allows processing instruction targets as NCNames', () => {
		jsonMlMapper.parse([
			'someOtherParentElement',
			['?someTarget', 'someData']
		], documentNode);
		chai.assert.isTrue(evaluateXPathToBoolean('self::processing-instruction(someTarget)', documentNode.documentElement.firstChild));
	});

	it('allows processing instruction tests without an axis, without a target', () => {
		jsonMlMapper.parse([
			'someOtherParentElement',
			['?someTarget', 'someData']
		], documentNode);
		chai.assert.isTrue(evaluateXPathToBoolean('processing-instruction()', documentNode.documentElement));
	});

	it('allows processing instruction tests without an axis, with a target NCName', () => {
		jsonMlMapper.parse([
			'someOtherParentElement',
			['?someTarget', 'someData']
		], documentNode);
		chai.assert.isTrue(evaluateXPathToBoolean('processing-instruction(someTarget)', documentNode.documentElement));
	});

	it('allows processing instruction tests without an axis, with a target literal string', () => {
		jsonMlMapper.parse([
			'someOtherParentElement',
			['?someTarget', 'someData']
		], documentNode);
		chai.assert.isTrue(evaluateXPathToBoolean('processing-instruction("someTarget")', documentNode.documentElement));
	});
});
