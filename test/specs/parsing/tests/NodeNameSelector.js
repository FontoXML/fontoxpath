import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import evaluateXPath from 'fontoxml-selectors/evaluateXPath';
import evaluateXPathToBoolean from 'fontoxml-selectors/evaluateXPathToBoolean';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('nameTests', () => {
	it('allows wildcards', () => {
		const element = documentNode.createElement('someElement');
		chai.expect(evaluateXPathToBoolean('self::*', element, blueprint)).to.equal(true);
	});

	it('allows nodeNames containing namespaces', () => {
		const element = documentNode.createElement('someNamespace:someElement');
		chai.expect(evaluateXPath('self::someNamespace:someElement', element, blueprint)).to.deep.equal(element);
	});
});
