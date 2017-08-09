import { evaluateXPathToAsyncIterator } from 'fontoxpath';
export default async function evaluateXPathToAsyncSingleton (xpath, documentNode) {
	const iterator = evaluateXPathToAsyncIterator(xpath, documentNode);
	const first = await iterator.next();
	if (first.done) {
		return null;
	}
	chai.assert.isTrue((await iterator.next()).done);
	return first.value;
}
