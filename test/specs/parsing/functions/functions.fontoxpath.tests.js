import chai from 'chai';
import * as slimdom from 'slimdom';

import {
	domFacade,
	evaluateXPathToBoolean,
	evaluateXPathToString
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('extension functions', () => {
	describe('fontoxpath:version()', () => {
		it('returns the version', () => {
			try {
				chai.assert.equal(evaluateXPathToString('fontoxpath:version()'), 'devbuild');
			} catch (_error) {
				chai.assert.match(
					evaluateXPathToString('fontoxpath:version()'),
						/\d+\.\d+\.\d+/);
			}
		});
	});
	describe('fontoxpath:evaluate()', () => {
		it('can run inline functions',
			() => chai.assert.equal(evaluateXPathToBoolean('fontoxpath:evaluate("true()", map{})', documentNode, domFacade), true));
		it('can iterate over the same sequence, inside the evaluate call',
			() => chai.assert.equal(evaluateXPathToBoolean('fontoxpath:evaluate("count($x) + count(reverse($x))", map{"x": (1,2,3,4,5)})', documentNode, domFacade), true));
		it('can run inline inline functions',
			() => chai.assert.equal(evaluateXPathToBoolean('fontoxpath:evaluate("fontoxpath:evaluate(""true()"", map{})", map{})', documentNode, domFacade), true));
		it('can run inside inline functions',
			() => chai.assert.equal(evaluateXPathToBoolean('function() {fontoxpath:evaluate("true()", map{})}()', documentNode, domFacade), true));
		it('accepts parameters',
			() => chai.assert.equal(evaluateXPathToBoolean('fontoxpath:evaluate("$a", map{"a":true()})', documentNode, domFacade), true));
		it('retains namespaces in scope', () => {
			chai.assert.equal(
				evaluateXPathToBoolean(
					'fontoxpath:evaluate("fun:true()", map{})',
					documentNode,
					domFacade,
					{},
					{ namespaceResolver: prefix => ({ fun: 'http://www.w3.org/2005/xpath-functions' }[prefix]) }),
				true);
		});
		it('accepts "." as contextItem',
			() => chai.assert.equal(evaluateXPathToBoolean('fontoxpath:evaluate(".", map{".":true()})', documentNode, domFacade), true));

	});
});
