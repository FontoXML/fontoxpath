import slimdom from 'slimdom';

import { domFacade, evaluateXPathToBoolean } from 'fontoxml-selectors';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('processing-instruction()', () => {
	it('allows processing instruction targets as literals', () => {
		const selector = ('self::processing-instruction("someTarget")');
		jsonMlMapper.parse([
			'someOtherParentElement',
			['?someTarget', 'someData']
		], documentNode);
		chai.expect(evaluateXPathToBoolean(selector, documentNode.documentElement.firstChild, domFacade)).to.equal(true);
	});

	it('allows processing instruction tests without a target', () => {
		const selector = ('self::processing-instruction()');
		jsonMlMapper.parse([
			'someOtherParentElement',
			['?someTarget', 'someData']
		], documentNode);
		chai.expect(evaluateXPathToBoolean(selector, documentNode.documentElement.firstChild, domFacade)).to.equal(true);
	});

	it('allows processing instruction targets as NCNames', () => {
		const selector = ('self::processing-instruction(someTarget)');
		jsonMlMapper.parse([
			'someOtherParentElement',
			['?someTarget', 'someData']
		], documentNode);
		chai.expect(evaluateXPathToBoolean(selector, documentNode.documentElement.firstChild, domFacade)).to.equal(true);
	});

	it('allows processing instruction tests without an axis, without a target', () => {
		const selector = ('processing-instruction()');
		jsonMlMapper.parse([
			'someOtherParentElement',
			['?someTarget', 'someData']
		], documentNode);
		chai.expect(evaluateXPathToBoolean(selector, documentNode.documentElement, domFacade)).to.equal(true);
	});

	it('allows processing instruction tests without an axis, with a target NCName', () => {
		const selector = ('processing-instruction(someTarget)');
		jsonMlMapper.parse([
			'someOtherParentElement',
			['?someTarget', 'someData']
		], documentNode);
		chai.expect(evaluateXPathToBoolean(selector, documentNode.documentElement, domFacade)).to.equal(true);
	});

	it('allows processing instruction tests without an axis, with a target literal string', () => {
		const selector = ('processing-instruction("someTarget")');
		jsonMlMapper.parse([
			'someOtherParentElement',
			['?someTarget', 'someData']
		], documentNode);
		chai.expect(evaluateXPathToBoolean(selector, documentNode.documentElement, domFacade)).to.equal(true);
	});
});
