import atomize from '../dataTypes/atomize';
import castToType from '../dataTypes/castToType';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { BaseType } from '../dataTypes/Value';

import { FUNCTIONS_NAMESPACE_URI } from '../staticallyKnownNamespaces';

import FunctionDefinitionType from './FunctionDefinitionType';

const fnTrace: FunctionDefinitionType = (
	_dynamicContext,
	executionParameters,
	_staticContext,
	arg,
	label
) => {
	return arg.mapAll((allItems) => {
		const argumentAsStrings = atomize(sequenceFactory.create(allItems), executionParameters)
			.map((value) => castToType(value, { kind: BaseType.XSSTRING }))
			.getAllValues();

		let newMessage = '';
		for (let i = 0; i < argumentAsStrings.length; i++) {
			newMessage +=
				'{type: ' +
				argumentAsStrings[i].type +
				', value: ' +
				argumentAsStrings[i].value +
				'}\n';
		}
		if (label !== undefined) {
			newMessage += label.first().value;
		}
		executionParameters.logger.trace(newMessage);

		return sequenceFactory.create(allItems);
	});
};

export default {
	declarations: [
		{
			argumentTypes: [{kind: BaseType.ANY, item: BaseType.ITEM}],
			callFunction: fnTrace,
			localName: 'trace',
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			returnType: {kind: BaseType.ANY, item: BaseType.ITEM},
		},
		{
			argumentTypes: [{kind: BaseType.ANY, item: BaseType.ITEM}, {kind: BaseType.XSSTRING}],
			callFunction: fnTrace,
			localName: 'trace',
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			returnType: {kind: BaseType.ANY, item: BaseType.ITEM},
		},
	],
};
