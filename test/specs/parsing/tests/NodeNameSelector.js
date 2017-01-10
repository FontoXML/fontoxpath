import slimdom from 'slimdom';

import { domFacade } from 'fontoxpath';
import { evaluateXPathToBoolean, evaluateXPathToFirstNode } from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('nameTests', () => {
	it('allows wildcards', () => {
		const element = documentNode.createElement('someElement');
		chai.expect(evaluateXPathToBoolean('self::*', element, domFacade)).to.equal(true);
	});

	it('allows nodeNames containing namespaces', () => {
		const element = documentNode.createElement('someNamespace:someElement');
		chai.expect(evaluateXPathToFirstNode('self::someNamespace:someElement', element, domFacade)).to.deep.equal(element);
	});
});
