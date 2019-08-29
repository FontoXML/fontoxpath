import { DONE_TOKEN, notReady, ready, IAsyncIterator } from './expressions/util/iterators';

import isSubtypeOf from './expressions/dataTypes/isSubtypeOf';
import Value from './expressions/dataTypes/Value';
import ArrayValue from './expressions/dataTypes/ArrayValue';
import MapValue from './expressions/dataTypes/MapValue';

export function transformMapToObject(map: MapValue): IAsyncIterator<object> {
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
							default: seq => seq,
							multiple: () => {
								throw new Error(
									'Serialization error: The value of an entry in a map is expected to be a singleton sequence.'
								);
							}
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

					transformedValueIterator = transformXPathItemToJavascriptObject(val.value);
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
		}
	};
}

export function transformArrayToArray(array: ArrayValue): IAsyncIterator<any[]> {
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
							default: seq => seq,
							multiple: () => {
								throw new Error(
									'Serialization error: The value of an entry in an array is expected to be a singleton sequence.'
								);
							}
						})
						.tryGetFirst();
					if (!val.ready) {
						return notReady(val.promise);
					}
					if (val.value === null) {
						arr[i++] = null;
						continue;
					}
					transformedMemberGenerator = transformXPathItemToJavascriptObject(val.value);
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
		}
	};
}

export default function transformXPathItemToJavascriptObject(value: Value): IAsyncIterator<any> {
	if (isSubtypeOf(value.type, 'map(*)')) {
		return transformMapToObject(value as MapValue);
	}
	if (isSubtypeOf(value.type, 'array(*)')) {
		return transformArrayToArray(value as ArrayValue);
	}
	if (isSubtypeOf(value.type, 'xs:QName')) {
		return {
			next: () => ready(`Q{${value.value.namespaceURI || ''}}${value.value.localName}`)
		};
	}
	if (isSubtypeOf(value.type, 'xs:date')) {
		return {
			next: () => ready(value.value.toJavaScriptDate())
		}
	}

	return {
		next: () => ready(value.value)
	};
}
