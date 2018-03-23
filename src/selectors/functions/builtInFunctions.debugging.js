import castToType from '../dataTypes/castToType';
import atomize from '../dataTypes/atomize';
import Sequence from '../dataTypes/Sequence';

import { FUNCTIONS_NAMESPACE_URI } from '../staticallyKnownNamespaces';

function fnTrace (dynamicContext, arg, label) {
	return arg.mapAll(allItems => {
		const argumentAsStrings = allItems.map(value => castToType(atomize(value, dynamicContext), 'xs:string'));
		console.log.apply(console, label ? [argumentAsStrings, label.first().value] : [argumentAsStrings]);
		return new Sequence(allItems);
	});
}

export default {
	declarations: [
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'trace',
			argumentTypes: ['item()*'],
			returnType: 'item()*',
			callFunction: fnTrace
		},
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'trace',
			argumentTypes: ['item()*', 'xs:string'],
			returnType: 'item()*',
			callFunction: fnTrace
		}
	]
};
