import { evaluateXPathToAsyncIterator } from 'fontoxpath';
export default async function evaluateXPathToAsyncSingleton (xpath, documentNode) {
	const iterator = evaluateXPathToAsyncIterator(xpath, documentNode);
	const first = await iterator.next();
	if (first.done) {
		return null;
	}
	const second = await iterator.next();
	chai.assert.isTrue(second.done, 'The XPath should resolve to a singleton, or nothing.');
	return first.value;
}
