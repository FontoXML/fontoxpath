import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import evaluateXPath from 'fontoxml-selectors/evaluateXPath';
import jsonMLMapper from 'fontoxml-dom-utils/jsonMLMapper';
import parseSelector from 'fontoxml-selectors/parsing/createSelectorFromXPath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('operators', () => {
	it('uses correct operator precedence', () => {
		let selector = parseSelector('(child::someElement and ancestor::someParentElement) or @someAttribute=\'someValue\'');
		jsonMLMapper.parse([
			'someParentElement',
			[
				'someMiddleElement',
				{ 'someAttribute': 'someValue' },
				['someOtherElement']
			]
		], documentNode);
		chai.expect(evaluateXPath(selector, documentNode.documentElement.firstChild, blueprint)).to.equal(true);
		// The other way around
		selector = parseSelector('(child::someOtherElement and ancestor::someParentElement) or @someAttribute=\'someOtherValue\'');
		chai.expect(evaluateXPath(selector, documentNode.documentElement.firstChild, blueprint)).to.equal(true);
		// Changes to testcase A: Operator order changed because of parentheses
		selector = parseSelector('child::someElement and (ancestor::someParentElement or @someAttribute="someValue")');
		chai.expect(evaluateXPath(selector, documentNode.documentElement.firstChild, blueprint)).to.equal(false);
	});
});
