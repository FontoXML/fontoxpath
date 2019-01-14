import * as chai from 'chai';
import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

import {
	evaluateXPathToNodes,
	evaluateXPathToMap,
	evaluateXPathToString
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('preceding', () => {
	it('returns the preceding nodes', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someOtherElement', ['someOtherElement']],
			['someElement']
		], documentNode);
		chai.assert.deepEqual(
			evaluateXPathToNodes(
				'preceding::someOtherElement',
				documentNode.documentElement.lastChild).map(node => (node as Element).outerHTML), [
					(documentNode.documentElement.firstChild as Element).outerHTML,
					(documentNode.documentElement.firstChild.firstChild as Element).outerHTML
		]);
	});

	it('returns all the preceding nodes', () => {
		const result = evaluateXPathToMap(
				`
let $dom := <element>
	<uncle expectedPreceding="true">
		<nephew expectedPreceding="true">
			<nephew expectedPreceding="true"/>
		</nephew>
	</uncle>
	<parent>
		<sibling expectedPreceding="true">
			<nephew expectedPreceding="true"/>
		</sibling>
		<self>
			<child/>
		</self>
		<sibling>
			<nephew/>
		</sibling>
	</parent>
	<uncle>
		<nephew>
			<nephew/>
		</nephew>
	</uncle>
</element>

return map{
	"got": array{$dom!descendant::self[1]!preceding::*},
	"expected": array{($dom!descendant-or-self::*[@expectedPreceding])}
}
`,
				documentNode,
				null,
				null,
				{ language: 'XQuery3.1' }
		);
		chai.assert.equal(result.got.length, 5);
		chai.assert.equal(result.expected.length, 5);
		chai.assert.deepEqual(result.got, result.expected);
	});

	it('does not return non-matching preceding nodes', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someNonMatchingElement', ['someNonMatchingElement']],
			['someElement']
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('preceding::someSiblingElement', documentNode.documentElement.lastChild), []);
	});

	it('correctly orders its results', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someNonMatchingElement', ['someSiblingElement', { position: 'first' }]],
			['someNonMatchingElement', ['someSiblingElement', { position: 'second' }]],
			['someElement']
		], documentNode);
		chai.assert.equal(
			evaluateXPathToString('(preceding::someSiblingElement)[1]/@position', documentNode.documentElement.lastChild),
			'first');
	});

	it('does nothing when there are no preceding siblings', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someElement']
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('preceding::someSiblingElement', documentNode.documentElement.firstChild), []);
	});

	it('throws the correct error if context is absent', () => {
		chai.assert.throws(() => evaluateXPathToNodes('preceding::*', null), 'XPDY0002');
	});
});
