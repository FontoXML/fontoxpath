import slimdom from 'slimdom';

import { domFacade } from 'fontoxml-selectors';
import { evaluateXPathToBoolean } from 'fontoxml-selectors';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('operators', () => {
	it('uses correct operator precedence', () => {
		let selector = ('(child::someElement and ancestor::someParentElement) or @someAttribute=\'someValue\'');
		jsonMlMapper.parse([
			'someParentElement',
			[
				'someMiddleElement',
				{ 'someAttribute': 'someValue' },
				['someOtherElement']
			]
		], documentNode);
		chai.expect(evaluateXPathToBoolean(selector, documentNode.documentElement.firstChild, domFacade)).to.equal(true);
		// The other way around
		selector = ('(child::someOtherElement and ancestor::someParentElement) or @someAttribute=\'someOtherValue\'');
		chai.expect(evaluateXPathToBoolean(selector, documentNode.documentElement.firstChild, domFacade)).to.equal(true);
		// Changes to testcase A: Operator order changed because of parentheses
		selector = ('child::someElement and (ancestor::someParentElement or @someAttribute="someValue")');
		chai.expect(evaluateXPathToBoolean(selector, documentNode.documentElement.firstChild, domFacade)).to.equal(false);
	});
});
