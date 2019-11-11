import * as chai from 'chai';
import {
	domFacade,
	evaluateXPathToBoolean,
	evaluateXPathToNumber,
	evaluateXPathToString
} from 'fontoxpath';
import * as slimdom from 'slimdom';

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
				chai.assert.match(evaluateXPathToString('fontoxpath:version()'), /\d+\.\d+\.\d+/);
			}
		});
	});
	describe('fontoxpath:evaluate()', () => {
		it('can run inline functions', () =>
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					'fontoxpath:evaluate("true()", map{})',
					documentNode,
					domFacade
				)
			));
		it('can iterate over the same sequence, inside the evaluate call', () =>
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					'fontoxpath:evaluate("count($x) + count(reverse($x))", map{"x": (1,2,3,4,5)})',
					documentNode,
					domFacade
				)
			));
		it('can run inline inline functions', () =>
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					'fontoxpath:evaluate("fontoxpath:evaluate(""true()"", map{})", map{})',
					documentNode,
					domFacade
				)
			));
		it('can run inside inline functions', () =>
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					'function() {fontoxpath:evaluate("true()", map{})}()',
					documentNode,
					domFacade
				)
			));
		it('accepts parameters', () =>
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					'fontoxpath:evaluate("$a", map{"a":true()})',
					documentNode,
					domFacade
				)
			));
		it('retains namespaces in scope', () => {
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					'fontoxpath:evaluate("fun:true()", map{})',
					documentNode,
					domFacade,
					{},
					{
						namespaceResolver: prefix =>
							({ fun: 'http://www.w3.org/2005/xpath-functions' }[prefix])
					}
				)
			);
		});
		it('accepts "." as contextItem', () =>
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					'fontoxpath:evaluate(".", map{".":true()})',
					documentNode,
					domFacade
				)
			));
		it('also allows XQuery to be evaluated', () =>
			chai.assert.equal(
				evaluateXPathToNumber(
					'fontoxpath:evaluate("declare default function namespace ""http://www.w3.org/2005/xpath-functions/math""; exp10(3)", map{})'
				),
				1000
			));
	});
});
