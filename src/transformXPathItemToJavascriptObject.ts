import { DONE_TOKEN, IAsyncIterator, notReady, ready } from './expressions/util/iterators';

import realizeDom from './domClone/realizeDom';
import ArrayValue from './expressions/dataTypes/ArrayValue';
import isSubtypeOf from './expressions/dataTypes/isSubtypeOf';
import MapValue from './expressions/dataTypes/MapValue';
import Value from './expressions/dataTypes/Value';
import ExecutionParameters from './expressions/ExecutionParameters';

export function transformMapToObject(
	map: MapValue,
	executionParameters: ExecutionParameters
): IAsyncIterator<object> {
	const mapObj = {};
	let i = 0;
	let done = false;
	let transformedValueIterator = null;
	return {
		next: () => {
			if (done) {
				return DONE_TOKEN;
			}
			while (i < map.keyValuePairs.length) {
				if (!transformedValueIterator) {
					const val = map.keyValuePairs[i]
						.value()
						.switchCases({
							default: (seq) => seq,
							multiple: () => {
								throw new Error(
									'Serialization error: The value of an entry in a map is expected to be a singleton sequence.'
								);
							},
						})
						.tryGetFirst();
					if (!val.ready) {
						return notReady(val.promise);
					}
					if (val.value === null) {
						mapObj[map.keyValuePairs[i].key.value] = null;
						i++;
						continue;
					}

					transformedValueIterator = transformXPathItemToJavascriptObject(
						val.value,
						executionParameters
					);
				}
				const transformedValue = transformedValueIterator.next();
				if (!transformedValue.ready) {
					return transformedValue;
				}
				transformedValueIterator = null;
				mapObj[map.keyValuePairs[i].key.value] = transformedValue.value;
				i++;
			}
			done = true;
			return ready(mapObj);
		},
	};
}

export function transformArrayToArray(
	array: ArrayValue,
	executionParameters: ExecutionParameters
): IAsyncIterator<any[]> {
	const arr = [];
	let i = 0;
	let done = false;
	let transformedMemberGenerator = null;
	return {
		next: () => {
			if (done) {
				return DONE_TOKEN;
			}
			while (i < array.members.length) {
				if (!transformedMemberGenerator) {
					const val = array.members[i]()
						.switchCases({
							default: (seq) => seq,
							multiple: () => {
								throw new Error(
									'Serialization error: The value of an entry in an array is expected to be a singleton sequence.'
								);
							},
						})
						.tryGetFirst();
					if (!val.ready) {
						return notReady(val.promise);
					}
					if (val.value === null) {
						arr[i++] = null;
						continue;
					}
					transformedMemberGenerator = transformXPathItemToJavascriptObject(
						val.value,
						executionParameters
					);
				}
				const transformedValue = transformedMemberGenerator.next();
				if (!transformedValue.ready) {
					return transformedValue;
				}
				transformedMemberGenerator = null;
				arr[i++] = transformedValue.value;
			}
			done = true;
			return ready(arr);
		},
	};
}

export default function transformXPathItemToJavascriptObject(
	value: Value,
	executionParameters: ExecutionParameters
): IAsyncIterator<any> {
	if (isSubtypeOf(value.type, 'map(*)')) {
		return transformMapToObject(value as MapValue, executionParameters);
	}
	if (isSubtypeOf(value.type, 'array(*)')) {
		return transformArrayToArray(value as ArrayValue, executionParameters);
	}
	if (isSubtypeOf(value.type, 'xs:QName')) {
		return {
			next: () => ready(`Q{${value.value.namespaceURI || ''}}${value.value.localName}`),
		};
	}

	// Make it actual here
	switch (value.type) {
		case 'xs:date':
		case 'xs:time':
		case 'xs:dateTime':
		case 'xs:gYearMonth':
		case 'xs:gYear':
		case 'xs:gMonthDay':
		case 'xs:gMonth':
		case 'xs:gDay':
			return {
				next: () => ready(value.value.toJavaScriptDate()),
			};
		case 'attribute()':
		case 'node()':
		case 'element()':
		case 'document-node()':
		case 'text()':
		case 'processing-instruction()':
		case 'comment()':
			return {
				next: () => ready(realizeDom(value.value, executionParameters, false)),
			};

		default:
			return {
				next: () => ready(value.value),
			};
	}
}
