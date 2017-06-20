import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

import {
	evaluateXPathToBoolean
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('operators', () => {
	it('uses correct operator precedence', () => {
		jsonMlMapper.parse([
			'someParentElement',
			[
				'someMiddleElement',
				{ someAttribute: 'someValue' },
				['someOtherElement']
			]
		], documentNode);
		chai.assert.isTrue(evaluateXPathToBoolean('(child::someElement and ancestor::someParentElement) or @someAttribute=\'someValue\'', documentNode.documentElement.firstChild));
		// The other way around
		chai.assert.isTrue(evaluateXPathToBoolean('(child::someOtherElement and ancestor::someParentElement) or @someAttribute=\'someOtherValue\'', documentNode.documentElement.firstChild));
		// Changes to testcase A: Operator order changed because of parentheses
		chai.assert.isFalse(evaluateXPathToBoolean('child::someElement and (ancestor::someParentElement or @someAttribute="someValue")', documentNode.documentElement.firstChild));
	});
});
