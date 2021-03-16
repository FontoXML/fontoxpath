import { DONE_TOKEN, IAsyncIterator, ready } from './expressions/util/iterators';

import realizeDom from './domClone/realizeDom';
import ArrayValue from './expressions/dataTypes/ArrayValue';
import isSubtypeOf from './expressions/dataTypes/isSubtypeOf';
import MapValue from './expressions/dataTypes/MapValue';
import Value from './expressions/dataTypes/Value';
import ExecutionParameters from './expressions/ExecutionParameters';
import QName from './expressions/dataTypes/valueTypes/QName';
import DateTime from './expressions/dataTypes/valueTypes/DateTime';
import { NodePointer } from './domClone/Pointer';

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
				// Assume the keys for a map are strings.
				const key = map.keyValuePairs[i].key.value as string;

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
						.first();
					if (val === null) {
						mapObj[key] = null;
						i++;
						continue;
					}

					transformedValueIterator = transformXPathItemToJavascriptObject(
						val,
						executionParameters
					);
				}
				const transformedValue = transformedValueIterator.next();
				transformedValueIterator = null;
				mapObj[key] = transformedValue.value;
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
						.first();
					if (val === null) {
						arr[i++] = null;
						continue;
					}
					transformedMemberGenerator = transformXPathItemToJavascriptObject(
						val,
						executionParameters
					);
				}
				const transformedValue = transformedMemberGenerator.next();
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
		const qualifiedName = value.value as QName;
		return {
			next: () => ready(`Q{${qualifiedName.namespaceURI || ''}}${qualifiedName.localName}`),
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
		case 'xs:gDay': {
			const temporalValue = value.value as DateTime;
			return {
				next: () => ready(temporalValue.toJavaScriptDate()),
			};
		}
		case 'attribute()':
		case 'node()':
		case 'element()':
		case 'document-node()':
		case 'text()':
		case 'processing-instruction()':
		case 'comment()': {
			const nodeValue = value.value as NodePointer;
			return {
				next: () => ready(realizeDom(nodeValue, executionParameters, false)),
			};
		}

		default:
			return {
				next: () => ready(value.value),
			};
	}
}
