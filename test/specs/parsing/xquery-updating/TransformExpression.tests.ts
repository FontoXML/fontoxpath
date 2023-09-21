import * as chai from 'chai';
import { evaluateUpdatingExpression, evaluateXPath } from 'fontoxpath';
import IDomFacade from 'fontoxpath/domFacade/IDomFacade';
import DomBackedNodesFactory from 'fontoxpath/nodesFactory/DomBackedNodesFactory';
import { Document, Node, XMLSerializer, parseXmlDocument } from 'slimdom';
import assertUpdateList from './assertUpdateList';

let documentNode: Document;
beforeEach(() => {
	documentNode = new Document();
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
			{ returnType: evaluateXPath.NODES_TYPE },
		);
		chai.assert.equal(result.xdmValue.length, 1);
		const actualXml = new XMLSerializer().serializeToString(result.xdmValue[0]);
		chai.assert.equal(actualXml, '<element>content</element>');
		assertUpdateList(result.pendingUpdateList, [
			{
				replacementXML: ['<replacement/>'],
				target: element,
				type: 'replaceNode',
			},
			{
				newName: {
					localName: 'renamed',
					namespaceURI: null,
					prefix: '',
				},
				target: element,
				type: 'rename',
			},
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
				returnType: evaluateXPath.NODES_TYPE,
			},
		);
		chai.assert.equal(result.xdmValue.length, 1);
		const actualXml = new XMLSerializer().serializeToString(result.xdmValue[0]);
		chai.assert.equal(actualXml, '<element>content</element>');
		assertUpdateList(result.pendingUpdateList, [
			{
				type: 'replaceNode',
				target: element,
				replacementXML: ['<replacement/>'],
			},
		]);
	});

	it('can be used in evaluateXPath', async () => {
		documentNode.appendChild(documentNode.createElement('element'));
		const result = evaluateXPath(
			`
copy $a := element
modify replace value of node $a with "content"
return ($a)
`,
			documentNode,
			null,
			{},
			evaluateXPath.NODES_TYPE,
			{
				language: evaluateXPath.XQUERY_UPDATE_3_1_LANGUAGE,
			},
		) as Node[];
		chai.assert.equal(result.length, 1);
		const actualXml = new XMLSerializer().serializeToString(result[0]);
		chai.assert.equal(actualXml, '<element>content</element>');
	});

	it('can clone the node with its child nodes', async () => {
		documentNode = parseXmlDocument(`
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
			{},
		);
		const actualXml = new XMLSerializer().serializeToString(result.xdmValue[0]);
		const expectedXml = new XMLSerializer().serializeToString(documentNode.documentElement);
		chai.assert.equal(actualXml, expectedXml);
		assertUpdateList(result.pendingUpdateList, []);
	});

	it('can clone the Document with its child nodes', async () => {
		documentNode = parseXmlDocument(`
		<?process instruction ?>
		<xml xmlns:xml="http://www.w3.org/XML/1998/namespace"/>`);

		const result = await evaluateUpdatingExpression(
			`copy $a := . modify () return $a`,
			documentNode,
			null,
			{},
			{},
		);
		const actualXml = new XMLSerializer().serializeToString(result.xdmValue[0]);
		const expectedXml = new XMLSerializer().serializeToString(documentNode);
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

		documentNode = parseXmlDocument(xml);

		const result = await evaluateUpdatingExpression(
			`copy $a := xml modify () return $a`,
			documentNode,
			null,
			{},
			{},
		);
		const actualXml = new XMLSerializer().serializeToString(result.xdmValue[0]);
		const newlySyncXMLDoc = new XMLSerializer().serializeToString(parseXmlDocument(xml));
		const afterCloneXMLDoc = new XMLSerializer().serializeToString(documentNode);
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

		documentNode = parseXmlDocument(xml);

		const result = await evaluateUpdatingExpression(
			`copy $a := . modify () return $a`,
			documentNode,
			null,
			{},
			{ nodesFactory: new DomBackedNodesFactory(documentNode) },
		);
		const actualXml = new XMLSerializer().serializeToString(result.xdmValue[0]);
		const newlySyncXMLDoc = new XMLSerializer().serializeToString(parseXmlDocument(xml));
		const afterCloneXMLDoc = new XMLSerializer().serializeToString(documentNode);
		chai.assert.equal(newlySyncXMLDoc, afterCloneXMLDoc);
		assertUpdateList(result.pendingUpdateList, []);
	});

	it('uses the dom facade', async () => {
		const xml = documentNode.createElement('xml');

		const a = documentNode.createElement('a');

		// <xml><a/></xml>
		const getChildNode = (node: Node) =>
			node === documentNode ? xml : node === xml ? a : null;
		const myDomFacade: IDomFacade = {
			getAllAttributes: () => [],
			getAttribute: () => null,
			getChildNodes: (node: Node) => (getChildNode(node) ? [getChildNode(node)] : []),
			getData: () => '',
			getFirstChild: getChildNode,
			getLastChild: getChildNode,
			getNextSibling: () => null,
			getParentNode: (node: Node) => (node === a ? xml : node === xml ? documentNode : null),
			getPreviousSibling: () => null,
		};

		const result = await evaluateUpdatingExpression(
			`copy $a := xml modify () return $a`,
			documentNode,
			myDomFacade,
			{},
			{},
		);
		const actualXml = new XMLSerializer().serializeToString(result.xdmValue[0]);
		const expectedXml = new XMLSerializer().serializeToString(
			parseXmlDocument('<xml><a/></xml>'),
		);
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
				{},
			);
		} catch (err) {
			error = err;
		}

		chai.assert.match(error.message, new RegExp('XUDY0014'));
	});
});
