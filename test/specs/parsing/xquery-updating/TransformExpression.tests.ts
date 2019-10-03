import * as chai from 'chai';
import { evaluateUpdatingExpression, evaluateXPath, Language, ReturnType } from 'fontoxpath';
import DomBackedNodesFactory from 'fontoxpath/nodesFactory/DomBackedNodesFactory';
import { Document } from 'slimdom';
import { slimdom, sync } from 'slimdom-sax-parser';
import IDomFacade from '../../../../src/domFacade/IDomFacade';
import assertUpdateList from './assertUpdateList';

let documentNode: Document;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('TransformExpression', () => {
	it('merges puls from copy clauses', async () => {
		const element = documentNode.appendChild(documentNode.createElement('element'));
		const result = await evaluateUpdatingExpression(
			`
copy $a := (element, replace node element with <replacement/>),
     $b := (element, rename node element as "renamed")
modify replace value of node $a with "content"
return $a
`,
			documentNode,
			null,
			{},
			{ returnType: ReturnType.NODES }
		);
		chai.assert.equal(result.xdmValue.length, 1);
		const actualXml = new slimdom.XMLSerializer().serializeToString(result.xdmValue[0]);
		chai.assert.equal(actualXml, '<element>content</element>');
		assertUpdateList(result.pendingUpdateList, [
			{
				replacementXML: ['<replacement/>'],
				target: element,
				type: 'replaceNode'
			},
			{
				newName: {
					localName: 'renamed',
					namespaceURI: null,
					prefix: ''
				},
				target: element,
				type: 'rename'
			}
		]);
	});

	it('returns pul from return clause', async () => {
		const element = documentNode.appendChild(documentNode.createElement('element'));
		const result = await evaluateUpdatingExpression(
			`
copy $a := element
modify replace value of node $a with "content"
return ($a, replace node element with <replacement/>)
`,
			documentNode,
			null,
			{},
			{
				returnType: ReturnType.NODES
			}
		);
		chai.assert.equal(result.xdmValue.length, 1);
		const actualXml = new slimdom.XMLSerializer().serializeToString(result.xdmValue[0]);
		chai.assert.equal(actualXml, '<element>content</element>');
		assertUpdateList(result.pendingUpdateList, [
			{
				type: 'replaceNode',
				target: element,
				replacementXML: ['<replacement/>']
			}
		]);
	});

	it('can be used in evaluateXPath', async () => {
		const element = documentNode.appendChild(documentNode.createElement('element'));
		const result = await evaluateXPath(
			`
copy $a := element
modify replace value of node $a with "content"
return ($a)
`,
			documentNode,
			null,
			{},
			ReturnType.NODES,
			{
				language: Language.XQUERY_UPDATE_3_1_LANGUAGE
			}
		);
		chai.assert.equal(result.length, 1);
		const actualXml = new slimdom.XMLSerializer().serializeToString(result[0]);
		chai.assert.equal(actualXml, '<element>content</element>');
	});

	it('can clone the node with its child nodes', async () => {
		documentNode = sync(`
		<xml xmlns:xml="http://www.w3.org/XML/1998/namespace">
			<?process instruction ?>
			<!-- comment -->
			<![CDATA[  <, & and ) *and* %MyParamEnt]]>
			<parent>
				<child attribute="uncle"/>
				<sibling>
					<nephew>
						i am baby johnny
					</nephew>
				</sibling>
			</parent>
		</xml>`);

		const result = await evaluateUpdatingExpression(
			`copy $a := xml modify () return $a`,
			documentNode,
			null,
			{},
			{}
		);
		const actualXml = new slimdom.XMLSerializer().serializeToString(result.xdmValue[0]);
		const expectedXml = new slimdom.XMLSerializer().serializeToString(
			documentNode.documentElement
		);
		chai.assert.equal(actualXml, expectedXml);
		assertUpdateList(result.pendingUpdateList, []);
	});

	it('can clone the Document with its child nodes', async () => {
		documentNode = sync(`
		<?process instruction ?>
		<xml xmlns:xml="http://www.w3.org/XML/1998/namespace"/>`);

		const result = await evaluateUpdatingExpression(
			`copy $a := . modify () return $a`,
			documentNode,
			null,
			{},
			{}
		);
		const actualXml = new slimdom.XMLSerializer().serializeToString(result.xdmValue[0]);
		const expectedXml = new slimdom.XMLSerializer().serializeToString(documentNode);
		chai.assert.equal(actualXml, expectedXml);
		assertUpdateList(result.pendingUpdateList, []);
	});

	it('there is no change in original document', async () => {
		const xml = `<xml xmlns:xml="http://www.w3.org/XML/1998/namespace">
		<?process instruction ?>
		<!-- comment -->
		<![CDATA[  <, & and ) *and* %MyParamEnt]]>
		<parent>
			<child attribute="uncle"/>
			<sibling>
				<nephew>
					i am baby johnny
				</nephew>
			</sibling>
		</parent>
	</xml>`;

		documentNode = sync(xml);

		const result = await evaluateUpdatingExpression(
			`copy $a := xml modify () return $a`,
			documentNode,
			null,
			{},
			{}
		);
		const actualXml = new slimdom.XMLSerializer().serializeToString(result.xdmValue[0]);
		const newlySyncXMLDoc = new slimdom.XMLSerializer().serializeToString(sync(xml));
		const afterCloneXMLDoc = new slimdom.XMLSerializer().serializeToString(documentNode);
		chai.assert.equal(newlySyncXMLDoc, afterCloneXMLDoc);
		assertUpdateList(result.pendingUpdateList, []);
	});

	it('can use NodesFactory', async () => {
		const xml = `<xml xmlns:xml="http://www.w3.org/XML/1998/namespace">
		<?process instruction ?>
		<!-- comment -->
		<![CDATA[  <, & and ) *and* %MyParamEnt]]>
		<parent>
			<child attribute="uncle"/>
			<sibling>
				<nephew>
					i am baby johnny
				</nephew>
			</sibling>
		</parent>
	</xml>`;

		documentNode = sync(xml);

		const result = await evaluateUpdatingExpression(
			`copy $a := . modify () return $a`,
			documentNode,
			null,
			{},
			{ nodesFactory: new DomBackedNodesFactory(documentNode) }
		);
		const actualXml = new slimdom.XMLSerializer().serializeToString(result.xdmValue[0]);
		const newlySyncXMLDoc = new slimdom.XMLSerializer().serializeToString(sync(xml));
		const afterCloneXMLDoc = new slimdom.XMLSerializer().serializeToString(documentNode);
		chai.assert.equal(newlySyncXMLDoc, afterCloneXMLDoc);
		assertUpdateList(result.pendingUpdateList, []);
	});

	it('uses the dom facade', async () => {
		const xml = documentNode.createElement('xml');

		const a = documentNode.createElement('a');

		// <xml><a/></xml>
		const getChildNode = (node: slimdom.Node) =>
			node === documentNode ? xml : node === xml ? a : null;
		const myDomFacade: IDomFacade = {
			getAllAttributes: () => [],
			getAttribute: () => null,
			getChildNodes: (node: slimdom.Node) => (getChildNode(node) ? [getChildNode(node)] : []),
			getData: () => '',
			getFirstChild: getChildNode,
			getLastChild: getChildNode,
			getNextSibling: () => null,
			getParentNode: (node: slimdom.Node) =>
				node === a ? xml : node === xml ? documentNode : null,
			getPreviousSibling: () => null
		};

		const result = await evaluateUpdatingExpression(
			`copy $a := xml modify () return $a`,
			documentNode,
			myDomFacade,
			{},
			{}
		);
		const actualXml = new slimdom.XMLSerializer().serializeToString(result.xdmValue[0]);
		const expectedXml = new slimdom.XMLSerializer().serializeToString(sync('<xml><a/></xml>'));
		chai.assert.equal(actualXml, expectedXml);
		assertUpdateList(result.pendingUpdateList, []);
	});

	it('throws when a target of in the pul of modify is not a clone', async () => {
		documentNode.appendChild(documentNode.createElement('a'));
		let error: Error | null;
		try {
			await evaluateUpdatingExpression(
				'copy $newVar := a modify replace node a with <b/> return $newVar',
				documentNode,
				null,
				{},
				{}
			);
		} catch (err) {
			error = err;
		}

		chai.assert.match(error!.message, new RegExp('XUDY0014'));
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
`,
			documentNode,
			null,
			{},
			{}
		);

		chai.assert.equal(result.xdmValue.length, 2);
		const actualA = new slimdom.XMLSerializer().serializeToString(result.xdmValue[0]);
		const actualB = new slimdom.XMLSerializer().serializeToString(result.xdmValue[1]);
		chai.assert.equal(actualA, '<element>content of a</element>');
		chai.assert.equal(actualB, '<element>content of b</element>');
		assertUpdateList(result.pendingUpdateList, []);
	});
});
