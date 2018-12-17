import chai from 'chai';
import * as slimdom from 'slimdom';

import {
	evaluateUpdatingExpression
} from 'fontoxpath';
import assertUpdateList from './assertUpdateList';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('TransformExpression', () => {
	it('merges puls from copy clauses', async () => {
		const element = documentNode.appendChild(documentNode.createElement('element'));
		const result = await evaluateUpdatingExpression(`
copy $a := (element, replace node element with <replacement/>),
     $b := (element, rename node element as "renamed")
modify replace value of node $a with "content"
return $a
`, documentNode, null, {}, {});
		chai.assert.equal(result.xdmValue.length, 1);
		const actualXml = new slimdom.XMLSerializer().serializeToString(result.xdmValue[0].value);
		chai.assert.equal(actualXml, '<element>content</element>');
		assertUpdateList(result.pendingUpdateList, [
			{
				type: 'replaceNode',
				target: element,
				replacementXML: ['<replacement/>']
			},
			{
				type: 'rename',
				target: element,
				newName: {
					prefix: '',
					namespaceURI: null,
					localPart: 'renamed'
				}
			}
		]);
	});

	it('returns pul from return clause', async () => {
		const element = documentNode.appendChild(documentNode.createElement('element'));
		const result = await evaluateUpdatingExpression(`
copy $a := element
modify replace value of node $a with "content"
return ($a, replace node element with <replacement/>)
`, documentNode, null, {}, {});
		chai.assert.equal(result.xdmValue.length, 1);
		const actualXml = new slimdom.XMLSerializer().serializeToString(result.xdmValue[0].value);
		chai.assert.equal(actualXml, '<element>content</element>');
		assertUpdateList(result.pendingUpdateList, [
			{
				type: 'replaceNode',
				target: element,
				replacementXML: ['<replacement/>']
			}
		]);
	});

	it('throws when a target of in the pul of modify is not a clone', async () => {
		documentNode.appendChild(documentNode.createElement('a'));
		let error;
		try {
			await evaluateUpdatingExpression('copy $newVar := a modify replace node a with <b/> return $newVar', documentNode, null, {}, {});
		} catch (err) {
			error = err;
		}

		if (error && error.message.startsWith('XUDY0014')) {
			chai.assert.isOk(error);
		} else {
			chai.assert.fail(error, 'XUDY0014', 'should throw a XUDY0014 error.');
		}
	});

	it('transforms something with something asynchronous', async () => {
		documentNode.appendChild(documentNode.createElement('element'));

		const result = await evaluateUpdatingExpression(
			`
declare namespace fontoxpath="http://fontoxml.com/fontoxpath";

copy $a := fontoxpath:sleep(/element, 100),
     $b := fontoxpath:sleep(/element, 100)
modify (fontoxpath:sleep(replace value of node $a with "content of a", 100),
        fontoxpath:sleep(replace value of node $b with "content of b", 100))
return fontoxpath:sleep(($a, $b), 100)
`, documentNode, null, {}, {});

		chai.assert.equal(result.xdmValue.length, 2);
		const actualA = new slimdom.XMLSerializer().serializeToString(result.xdmValue[0].value);
		const actualB = new slimdom.XMLSerializer().serializeToString(result.xdmValue[1].value);
		chai.assert.equal(actualA, '<element>content of a</element>');
		chai.assert.equal(actualB, '<element>content of b</element>');
		assertUpdateList(result.pendingUpdateList, []);
	});
});
