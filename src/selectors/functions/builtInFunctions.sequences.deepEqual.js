import NodeValue from '../dataTypes/NodeValue';
import Sequence from '../dataTypes/Sequence';
import { castToType } from '../dataTypes/conversionHelper';
import builtInFunctionsNode from './builtInFunctions.node';
/**
 * @type {function(../DynamicContext, ../dataTypes/Sequence):../dataTypes/Sequence}
 */
const nodeName = builtInFunctionsNode.functions.nodeName;

function filterElementAndTextNodes (node) {
	return node.nodeType === node.ELEMENT_NODE || node.nodeType === node.TEXT_NODE;
}

function anyAtomicTypeDeepEqual (_dynamicContext, item1, item2) {
	if ((item1.instanceOfType('xs:decimal') || item1.instanceOfType('xs:float')) &&
			(item2.instanceOfType('xs:decimal') || item2.instanceOfType('xs:float'))) {
		const temp1 = castToType(item1, 'xs:float'),
			temp2 = castToType(item2, 'xs:float');
		return temp1.value === temp2.value || (isNaN(item1.value) && isNaN(item2.value));
	}
	else if ((item1.instanceOfType('xs:decimal') || item1.instanceOfType('xs:float') || item1.instanceOfType('xs:double')) &&
			(item2.instanceOfType('xs:decimal') || item2.instanceOfType('xs:float') || item2.instanceOfType('xs:double'))) {
		const temp1 = castToType(item1, 'xs:double'),
			temp2 = castToType(item2, 'xs:double');
		return temp1.value === temp2.value || (isNaN(item1.value) && isNaN(item2.value));
	}
	return item1.value === item2.value;
}

function sequenceDeepEqual (dynamicContext, sequence1, sequence2) {
	if (sequence1.isEmpty() && sequence2.isEmpty()) {
		return true;
	}

	if (sequence1.value.length !== sequence2.value.length) {
		return false;
	}

	const length = sequence1.value.length;
	for (let i = 0; i < length; i++) {
		if (itemDeepEqual(dynamicContext, sequence1.value[i], sequence2.value[i])) {
			continue;
		}
		return false;
	}

	return true;
}

function mapTypeDeepEqual (dynamicContext, item1, item2) {
	if (item1.keyValuePairs.length !== item2.keyValuePairs.length) {
		return false;
	}

	return item1.keyValuePairs.every((mapEntry1) => {
		const mapEntry2 = item2.keyValuePairs.find((entry) => anyAtomicTypeDeepEqual(dynamicContext, entry.key, mapEntry1.key));

		if (!mapEntry2) {
			return false;
		}

		return sequenceDeepEqual(dynamicContext, mapEntry1.value, mapEntry2.value);
	});
}

function arrayTypeDeepEqual (dynamicContext, item1, item2) {
	if (item1.members.length !== item2.members.length) {
		return false;
	}

	return item1.members.every((arrayEntry1, index) => {
		const arrayEntry2 = item2.members[index];
		return sequenceDeepEqual(dynamicContext, arrayEntry1, arrayEntry2);
	});
}

function nodeDeepEqual (dynamicContext, item1, item2) {
	let item1Nodes = dynamicContext.domFacade.getChildNodes(item1.value),
		item2Nodes = dynamicContext.domFacade.getChildNodes(item2.value);

	item1Nodes = item1Nodes.filter(filterElementAndTextNodes);
	item2Nodes = item2Nodes.filter(filterElementAndTextNodes);

	item1Nodes = new Sequence(item1Nodes.map((node) => new NodeValue(dynamicContext.domFacade, node)));
	item2Nodes = new Sequence(item2Nodes.map((node) => new NodeValue(dynamicContext.domFacade, node)));

	return sequenceDeepEqual(dynamicContext, item1Nodes, item2Nodes);
}

function elementNodeDeepEqual (dynamicContext, item1, item2) {
	return sequenceDeepEqual(dynamicContext, nodeName(dynamicContext, Sequence.singleton(item1)), nodeName(dynamicContext, Sequence.singleton(item2))) &&
		nodeDeepEqual(dynamicContext, item1, item2);
}

// Nodes which contain an atomic type (text -> string, processing-instruction -> string, attribute -> any atomic type)
function atomicTypeNodeDeepEqual (dynamicContext, item1, item2) {
	return sequenceDeepEqual(dynamicContext, nodeName(dynamicContext, Sequence.singleton(item1)), nodeName(dynamicContext, Sequence.singleton(item2))) &&
		anyAtomicTypeDeepEqual(dynamicContext, item1.atomize(), item2.atomize());
}

function itemDeepEqual (dynamicContext, item1, item2) {
	// All atomic types
	if (item1.instanceOfType('xs:anyAtomicType') && item2.instanceOfType('xs:anyAtomicType')) {
		return anyAtomicTypeDeepEqual(dynamicContext, item1, item2);
	}

	// Maps
	if (item1.instanceOfType('map(*)') && item2.instanceOfType('map(*)')) {
		return mapTypeDeepEqual(dynamicContext, item1, item2);
	}

	// Arrays
	if (item1.instanceOfType('array(*)') && item2.instanceOfType('array(*)')) {
		return arrayTypeDeepEqual(dynamicContext, item1, item2);
	}

	// Nodes
	if (item1.instanceOfType('node()') && item2.instanceOfType('node()')) {
		// Document nodes
		if (item1.instanceOfType('document()') && item2.instanceOfType('document()')) {
			return nodeDeepEqual(dynamicContext, item1, item2);
		}

		// Element nodes, cannot be compared due to missing schema information
		if (item1.instanceOfType('element()') && item2.instanceOfType('element()')) {
			return elementNodeDeepEqual(dynamicContext, item1, item2);
		}

		// Attribute nodes
		if (item1.instanceOfType('attribute()') && item2.instanceOfType('attribute()')) {
			return atomicTypeNodeDeepEqual(dynamicContext, item1, item2);
		}

		// Processing instruction node
		if (item1.instanceOfType('processing-instruction()') && item2.instanceOfType('processing-instruction()')) {
			return atomicTypeNodeDeepEqual(dynamicContext, item1, item2);
		}

		// Text nodes
		if (item1.instanceOfType('text()') && item2.instanceOfType('text()')) {
			return atomicTypeNodeDeepEqual(dynamicContext, item1, item2);
		}
	}

	return false;
}

export default sequenceDeepEqual;
