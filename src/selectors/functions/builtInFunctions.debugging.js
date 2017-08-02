import castToType from '../dataTypes/castToType';
import atomize from '../dataTypes/atomize';
import Sequence from '../dataTypes/Sequence';

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
			name: 'trace',
			argumentTypes: ['item()*'],
			returnType: 'item()*',
			callFunction: fnTrace
		},
		{
			name: 'trace',
			argumentTypes: ['item()*', 'xs:string'],
			returnType: 'item()*',
			callFunction: fnTrace
		}
	]
};
