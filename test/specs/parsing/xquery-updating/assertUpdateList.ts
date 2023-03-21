import * as chai from 'chai';
import * as slimdom from 'slimdom';

export default function assertUpdateList(actual, expected) {
	chai.assert.equal(actual.length, expected.length, 'pendingUpdates.length');
	for (let i = 0, l = expected.length; i < l; ++i) {
		chai.assert.equal(actual[i].type, expected[i].type);
		chai.assert.equal(actual[i].target, expected[i].target);

		switch (actual[i].type) {
			case 'rename':
				chai.assert.equal(actual[i].newName.prefix, expected[i].newName.prefix);
				chai.assert.equal(actual[i].newName.namespaceURI, expected[i].newName.namespaceURI);
				chai.assert.equal(actual[i].newName.localName, expected[i].newName.localName);
				break;
			case 'replaceNode':
				actual[i].replacement.forEach((replacement, j) =>
					chai.assert.equal(
						new slimdom.XMLSerializer().serializeToString(replacement),
						expected[i].replacementXML[j]
					)
				);
				break;
			case 'replaceElementContent':
				chai.assert.equal(actual[i].text.data, expected[i].text);
				break;
			case 'replaceValue':
				chai.assert.equal(actual[i]['string-value'], expected[i].stringValue);
				break;
		}
	}
}
