import * as chai from 'chai';
import {
	evaluateXPath,
	evaluateXPathToBoolean,
	evaluateXPathToFirstNode,
	evaluateXPathToString,
	evaluateXPathToStrings,
} from 'fontoxpath';

import { sync } from 'slimdom-sax-parser';

import * as slimdom from 'slimdom';
import evaluateXPathToAsyncSingleton from 'test-helpers/evaluateXPathToAsyncSingleton';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('functions over nodes', () => {
	describe('node-name()', () => {
		it('returns an empty sequence if $arg is an empty sequence', () =>
			chai.assert.deepEqual(evaluateXPathToStrings('node-name(())', documentNode), []));

		it('it defaults to the context item when the argument is omitted', () => {
			jsonMlMapper.parse(['someElement', 'Some text.'], documentNode);
			chai.assert.equal(
				evaluateXPathToString('node-name()', documentNode.firstChild),
				'someElement'
			);
		});

		it('it returns the node name of the given context', () => {
			jsonMlMapper.parse(['someElement', 'Some text.'], documentNode);
			chai.assert.equal(
				evaluateXPathToString('node-name(.)', documentNode.firstChild),
				'someElement'
			);
		});
	});

	describe('local-name()', () => {
		it('returns the empty string if $arg is an empty sequence', () =>
			chai.assert.deepEqual(evaluateXPathToString('local-name(())', documentNode), ''));

		it('it defaults to the context item when the argument is omitted', () => {
			jsonMlMapper.parse(['someElement', 'Some text.'], documentNode);
			chai.assert.equal(
				evaluateXPathToString('local-name()', documentNode.firstChild),
				'someElement'
			);
		});

		it('it returns the node name of the given context', () => {
			jsonMlMapper.parse(['someElement', 'Some text.'], documentNode);
			chai.assert.equal(
				evaluateXPathToString('local-name(.)', documentNode.firstChild),
				'someElement'
			);
		});

		it('it returns the PI target for PIs', () => {
			jsonMlMapper.parse(['?somePi', 'With some data'], documentNode);
			chai.assert.equal(
				evaluateXPathToString('local-name(.)', documentNode.firstChild),
				'somePi'
			);
		});
	});

	describe('name()', () => {
		it('returns an empty sequence if $arg is an empty sequence', () =>
			chai.assert.deepEqual(evaluateXPathToStrings('name(())', documentNode), []));

		it('it defaults to the context item when the argument is omitted', () => {
			jsonMlMapper.parse(['someElement'], documentNode);
			chai.assert.equal(
				evaluateXPathToString('name()', documentNode.firstChild),
				'someElement'
			);
		});

		it('it returns the name including namespace prefixes', () => {
			const element = documentNode.createElementNS('http://example.com/ns', 'ns:someElement');
			chai.assert.equal(evaluateXPathToString('name()', element), 'ns:someElement');
		});

		it('it returns the node name of the given context', () => {
			jsonMlMapper.parse(['someElement'], documentNode);
			chai.assert.equal(
				evaluateXPathToString('name(.)', documentNode.firstChild),
				'someElement'
			);
		});

		it('it returns the target of a processing instruction', () => {
			jsonMlMapper.parse(['?some-pi', 'some data'], documentNode);
			chai.assert.equal(evaluateXPathToString('name(.)', documentNode.firstChild), 'some-pi');
		});

		it('it returns the name of an attribute', () => {
			jsonMlMapper.parse(['someElement', { someAttribute: 'someValue' }], documentNode);
			chai.assert.equal(
				evaluateXPathToString('name(@someAttribute)', documentNode.firstChild),
				'someAttribute'
			);
		});

		it('it returns the empty string for comments', () => {
			jsonMlMapper.parse(['!', 'some comment'], documentNode);
			chai.assert.equal(evaluateXPathToString('name(.)', documentNode.firstChild), '');
		});

		it('it returns the empty string for documents', () =>
			chai.assert.equal(evaluateXPathToString('name(.)', documentNode), ''));
	});

	describe('root()', () => {
		it('returns the root of the given context', () =>
			chai.assert.equal(evaluateXPathToFirstNode('root()', documentNode), documentNode));

		it('returns the root of the given document', () =>
			chai.assert.equal(evaluateXPathToFirstNode('root(.)', documentNode), documentNode));

		it('returns the root of the given constructed element', () =>
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					`
let $element := <root><child><node/></child></root>,
	$node := $element//node
return root($node) = $element`,
					documentNode,
					null,
					null,
					{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
				)
			));

		it('returns the root of the given constructed element from context', () =>
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					`
let $element := <root><child><node/></child></root>,
	$node := $element//node
return $node/root() = $element`,
					documentNode,
					null,
					null,
					{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
				)
			));
	});

	describe('outermost()', () => {
		it('returns the top level nodes if the set only contains nodes and their children', () => {
			jsonMlMapper.parse(['root', ['child'], ['child', ['descendant']]], documentNode);
			chai.assert.deepEqual(
				evaluateXPathToStrings('(/root//* => outermost())!name()', documentNode),
				['child', 'child']
			);
		});

		it('returns the top level nodes if the nodes are not direct children', () => {
			jsonMlMapper.parse(['root', ['child'], ['child', ['descendant']]], documentNode);
			chai.assert.deepEqual(
				evaluateXPathToStrings('(//* => outermost())!name()', documentNode),
				['root']
			);
		});

		it('sorts the passed sequence', () => {
			jsonMlMapper.parse(['root', ['child1'], ['child2', ['descendant']]], documentNode);
			chai.assert.deepEqual(
				evaluateXPathToStrings('outermost((//child2 | //child1))!name()', documentNode),
				['child1', 'child2']
			);
		});

		it('deduplicates the passed sequence', () => {
			jsonMlMapper.parse(['root', ['child1'], ['child2', ['descendant']]], documentNode);
			chai.assert.deepEqual(
				evaluateXPathToStrings('outermost((//child1 | //child1))!name()', documentNode),
				['child1']
			);
		});

		it('keeps attribute nodes', () => {
			jsonMlMapper.parse(
				['root', ['child1', { attr: 'value' }], ['child2', ['descendant']]],
				documentNode
			);
			chai.assert.deepEqual(
				evaluateXPathToStrings('outermost((//child2 | //@*))!name()', documentNode),
				['attr', 'child2']
			);
		});

		it('returns the empty sequence when passed the empty sequence', () =>
			chai.assert.deepEqual(evaluateXPathToStrings('outermost(())', documentNode), []));
	});

	describe('innermost()', () => {
		it('returns the bottom level nodes if the set only contains nodes and their children', () => {
			jsonMlMapper.parse(['root', ['child'], ['child', ['descendant']]], documentNode);
			chai.assert.deepEqual(
				evaluateXPathToStrings('(/root//* => innermost())!name()', documentNode),
				['child', 'descendant']
			);
		});

		it('returns the bottom level nodes if the nodes are not direct children', () => {
			jsonMlMapper.parse(['root', ['child'], ['child', ['descendant']]], documentNode);
			chai.assert.deepEqual(
				evaluateXPathToStrings('(//* => innermost())!name()', documentNode),
				['child', 'descendant']
			);
		});

		it('returns the bottom level nodes if the nodes are not direct children', () => {
			jsonMlMapper.parse(
				['root', ['child', ['descendant']], ['child', ['descendant'], ['descendant']]],
				documentNode
			);
			chai.assert.deepEqual(
				evaluateXPathToStrings('(//* => innermost())!name()', documentNode),
				['descendant', 'descendant', 'descendant']
			);
		});

		it('returns the bottom level nodes across two documents', () => {
			const docA = new slimdom.Document();
			jsonMlMapper.parse(['a', ['b'], ['c']], docA);
			const docB = new slimdom.Document();
			jsonMlMapper.parse(['A', ['B'], ['C']], docB);
			const result = evaluateXPathToStrings(
				'(innermost(($docA//node(), $docB//node())))!name()',
				documentNode,
				null,
				{ docA, docB }
			);
			try {
				chai.assert.deepEqual(result, ['b', 'c', 'B', 'C']);
			} catch (err) {
				chai.assert.deepEqual(result, ['B', 'C', 'b', 'c']);
			}
		});

		it('sorts the passed sequence', () => {
			jsonMlMapper.parse(['root', ['child1'], ['child2', ['descendant']]], documentNode);
			chai.assert.deepEqual(
				evaluateXPathToStrings('innermost((//child2 | //child1))!name()', documentNode),
				['child1', 'child2']
			);
		});

		it('deduplicates the passed sequence', () => {
			jsonMlMapper.parse(['root', ['child1'], ['child2', ['descendant']]], documentNode);
			chai.assert.deepEqual(
				evaluateXPathToStrings('innermost((//child1 | //child1))!name()', documentNode),
				['child1']
			);
		});

		it('does not remove attribute nodes', () => {
			jsonMlMapper.parse(
				['root', ['child1', { attr: 'value' }], ['child2', ['descendant']]],
				documentNode
			);
			chai.assert.deepEqual(
				evaluateXPathToStrings(
					'innermost((//child2 | //child1 | //@*))!name()',
					documentNode
				),
				['attr', 'child2']
			);
		});

		it('returns the empty sequence when passed the empty sequence', () =>
			chai.assert.deepEqual(evaluateXPathToStrings('innermost(())', documentNode), []));
	});

	describe('has-children()', () => {
		it('returns true, when the node has one or more child', () => {
			jsonMlMapper.parse(['root', ['child'], ['child', ['descendant']]], documentNode);
			chai.assert.deepEqual(evaluateXPathToBoolean('has-children(root)', documentNode), true);
		});

		it('returns false, when the node has no child', () => {
			jsonMlMapper.parse(['root', ['child'], ['child', ['descendant']]], documentNode);
			chai.assert.deepEqual(
				evaluateXPathToBoolean('has-children(//descendant)', documentNode),
				false
			);
		});

		it('returns false, if the function is run with an empty sequence', () => {
			jsonMlMapper.parse(['root', ['child'], ['child', ['descendant']]], documentNode);
			chai.assert.deepEqual(evaluateXPathToBoolean('has-children(())', documentNode), false);
		});

		it('defaults to the context item (.) and returns true, if the argument is omitted.', () => {
			jsonMlMapper.parse(['root', ['child'], ['child', ['descendant']]], documentNode);
			chai.assert.deepEqual(evaluateXPathToBoolean('has-children()', documentNode), true);
		});
	});

	describe('path', () => {
		it('returns "fn:root()" for the root of the document', () => {
			chai.assert.deepEqual(
				evaluateXPathToString(
					`let $emp :=
				<employee xml:id="ID21256">
				   <empnr>E21256</empnr>
				   <first>John</first>
				   <last>Brown</last>
				</employee> return fn:path($emp)`,
					documentNode,
					null,
					null,
					{
						language: evaluateXPath.XQUERY_3_1_LANGUAGE,
					}
				),
				'Q{http://www.w3.org/2005/xpath-functions}root()'
			);
		});

		it('returns "fn:root()/@Q{http://www.w3.org/XML/1998/namespace}id" for the id attribute of the root of the document', () => {
			chai.assert.deepEqual(
				evaluateXPathToString(
					`let $emp :=
				<employee xml:id="ID21256">
				   <empnr>E21256</empnr>
				   <first>John</first>
				   <last>Brown</last>
				</employee> return fn:path($emp/@xml:id)`,
					documentNode,
					null,
					null,
					{
						language: evaluateXPath.XQUERY_3_1_LANGUAGE,
					}
				),
				'Q{http://www.w3.org/2005/xpath-functions}root()/@Q{http://www.w3.org/XML/1998/namespace}id'
			);
		});

		it('returns "fn:root()/Q{}empnr[1]" for the <empnr> element of the document', () => {
			chai.assert.deepEqual(
				evaluateXPathToString(
					`let $emp :=
				<employee xml:id="ID21256">
				   <empnr>E21256</empnr>
				   <first>John</first>
				   <last>Brown</last>
				</employee> return fn:path($emp/empnr)`,
					documentNode,
					null,
					null,
					{
						language: evaluateXPath.XQUERY_3_1_LANGUAGE,
					}
				),
				'Q{http://www.w3.org/2005/xpath-functions}root()/Q{}empnr[1]'
			);
		});

		it('returns "/" for the document node', () => {
			documentNode = sync(
				`<p xmlns="http://example.com/one" xml:lang="de" author="Friedrich von Schiller">
				Freude, schöner Götterfunken,<br/>
				Tochter aus Elysium,<br/>
				Wir betreten feuertrunken,<br/>
				Himmlische, dein Heiligtum.</p>`
			);

			chai.assert.deepEqual(
				evaluateXPathToString(`let $e := . return fn:path($e)`, documentNode, null, null, {
					language: evaluateXPath.XQUERY_3_1_LANGUAGE,
				}),
				'/'
			);
		});

		it('returns "/Q{http://example.com/one}p[1]" for the <p> element of the document', () => {
			documentNode = sync(
				`<p xmlns="http://example.com/one" xml:lang="de" author="Friedrich von Schiller">
				Freude, schöner Götterfunken,<br/>
				Tochter aus Elysium,<br/>
				Wir betreten feuertrunken,<br/>
				Himmlische, dein Heiligtum.</p>`
			);

			chai.assert.deepEqual(
				evaluateXPathToString(
					`let $e := . return fn:path($e/*:p)`,
					documentNode,
					null,
					null,
					{
						language: evaluateXPath.XQUERY_3_1_LANGUAGE,
					}
				),
				'/Q{http://example.com/one}p[1]'
			);
		});

		it('returns "Q{http://example.com/one}p[1]/@Q{http://www.w3.org/XML/1998/namespace}lang" for the lang attribute of <p> element of the document', () => {
			documentNode = sync(
				`<p xmlns="http://example.com/one" xml:lang="de" author="Friedrich von Schiller">
				Freude, schöner Götterfunken,<br/>
				Tochter aus Elysium,<br/>
				Wir betreten feuertrunken,<br/>
				Himmlische, dein Heiligtum.</p>`,
				documentNode
			);

			chai.assert.deepEqual(
				evaluateXPathToString(
					`let $e := . return fn:path($e/*:p/@xml:lang)`,
					documentNode,
					null,
					null,
					{
						language: evaluateXPath.XQUERY_3_1_LANGUAGE,
					}
				),
				'/Q{http://example.com/one}p[1]/@Q{http://www.w3.org/XML/1998/namespace}lang'
			);
		});

		it('returns "Q{http://example.com/one}p[1]/@author" for the author attribute of <p> element of the document', () => {
			documentNode = sync(
				`<p xmlns="http://example.com/one" xml:lang="de" author="Friedrich von Schiller">
				Freude, schöner Götterfunken,<br/>
				Tochter aus Elysium,<br/>
				Wir betreten feuertrunken,<br/>
				Himmlische, dein Heiligtum.</p>`,
				documentNode
			);

			chai.assert.deepEqual(
				evaluateXPathToString(
					`let $e := . return fn:path($e/*:p/@author)`,
					documentNode,
					null,
					null,
					{
						language: evaluateXPath.XQUERY_3_1_LANGUAGE,
					}
				),
				'/Q{http://example.com/one}p[1]/@author'
			);
		});

		it('returns "/Q{http://example.com/one}p[1]/Q{http://example.com/one}br[2]" for the <br> element of the document', () => {
			documentNode = sync(
				`<p xmlns="http://example.com/one" xml:lang="de" author="Friedrich von Schiller">
				Freude, schöner Götterfunken,<br/>
				<said></said>
				Tochter aus Elysium,<br/> <said>
				blablabla </said>
				Wir betreten feuertrunken,<br/>
				Himmlische, dein Heiligtum.</p>`,
				documentNode
			);

			chai.assert.deepEqual(
				evaluateXPathToString(
					`let $e := . return fn:path($e/*:p/*:br[2])`,
					documentNode,
					null,
					null,
					{
						language: evaluateXPath.XQUERY_3_1_LANGUAGE,
					}
				),
				'/Q{http://example.com/one}p[1]/Q{http://example.com/one}br[2]'
			);
		});

		it('returns "/Q{http://example.com/one}p[1]/text()[2]" for the text node starting with "Tochter"', () => {
			documentNode = sync(
				`<p xmlns="http://example.com/one" xml:lang="de" author="Friedrich von Schiller">
				Freude, schöner Götterfunken,<br/>
				Tochter aus Elysium,<br/> <s/>
				Wir betreten feuertrunken,<br/>
				Himmlische, dein Heiligtum.</p>`,
				documentNode
			);

			chai.assert.deepEqual(
				evaluateXPathToString(
					`let $e := . return fn:path($e//text()[starts-with(normalize-space(), 'Tochter')])`,
					documentNode,
					null,
					null,
					{
						language: evaluateXPath.XQUERY_3_1_LANGUAGE,
					}
				),
				'/Q{http://example.com/one}p[1]/text()[2]'
			);
		});

		it('returns "empty sequence" for no argument', () => {
			chai.assert.deepEqual(
				evaluateXPathToStrings(`fn:path(())`, documentNode, null, null, {
					language: evaluateXPath.XQUERY_3_1_LANGUAGE,
				}),
				[]
			);
		});

		it('returns "fn:root()/Q{http://test2}a[1]" for the duplicate namespace URIs', () => {
			chai.assert.deepEqual(
				evaluateXPathToString(
					`let $dom :=
					<xml>
						<a:a xmlns:a="http://test"/>
						<a:a xmlns:a="http://test2"/>
			  		</xml> return fn:path($dom/*:a[2])`,
					documentNode,
					null,
					null,
					{
						language: evaluateXPath.XQUERY_3_1_LANGUAGE,
					}
				),
				'Q{http://www.w3.org/2005/xpath-functions}root()/Q{http://test2}a[1]'
			);
		});

		it('returns "fn:root()/Q{http://test}a[2]" for the duplicate namespace URIs', () => {
			chai.assert.deepEqual(
				evaluateXPathToString(
					`let $dom :=
					<xml>
						<a:a xmlns:a="http://test"/>
						<b:a xmlns:b="http://test"/>
			  		</xml> return fn:path($dom/*:a[2])`,
					documentNode,
					null,
					null,
					{
						language: evaluateXPath.XQUERY_3_1_LANGUAGE,
					}
				),
				'Q{http://www.w3.org/2005/xpath-functions}root()/Q{http://test}a[2]'
			);
		});

		it('returns "fn:root()/processing-instruction(stylesheet)[1]" for the processing instruction', () => {
			documentNode = sync(
				`<xml>
				<?TARGET DATA?>
				<?ANOTHER_TARGET  MORE DATA?>
				<?canAlsoBeLowerCaps data may contain spaces?>
				<?etc etc, etc?>
				</xml>`,
				documentNode
			);
			chai.assert.deepEqual(
				evaluateXPathToString(
					`fn:path(//processing-instruction()[3])`,
					documentNode,
					null,
					null,
					{
						language: evaluateXPath.XQUERY_3_1_LANGUAGE,
					}
				),
				'/Q{}xml[1]/processing-instruction(canAlsoBeLowerCaps)[1]'
			);
		});

		it('returns "fn:root()/processing-instruction(stylesheet)[1]" for the processing instruction', () => {
			documentNode = sync(
				`<xml>
				<?TARGET DATA?>
				<?TARGET MORE DATA?>
				<?TARGET data may contain spaces?>
				<?TARGET etc, etc?>
				</xml>`,
				documentNode
			);
			chai.assert.deepEqual(
				evaluateXPathToString(
					`fn:path(//processing-instruction()[3])`,
					documentNode,
					null,
					null,
					{
						language: evaluateXPath.XQUERY_3_1_LANGUAGE,
					}
				),
				'/Q{}xml[1]/processing-instruction(TARGET)[3]'
			);
		});
	});
});
