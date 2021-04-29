import { NodePointer } from './domClone/Pointer';
import realizeDom from './domClone/realizeDom';
import ArrayValue from './expressions/dataTypes/ArrayValue';
import isSubtypeOf from './expressions/dataTypes/isSubtypeOf';
import MapValue from './expressions/dataTypes/MapValue';
import Value, { BaseType } from './expressions/dataTypes/Value';
import DateTime from './expressions/dataTypes/valueTypes/DateTime';
import QName from './expressions/dataTypes/valueTypes/QName';
import ExecutionParameters from './expressions/ExecutionParameters';
import { DONE_TOKEN, IIterator, ready } from './expressions/util/iterators';

export function transformMapToObject(
	map: MapValue,
	executionParameters: ExecutionParameters
): IIterator<object> {
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
					const keyValuePair = map.keyValuePairs[i];
					const val = keyValuePair
						.value()
						.switchCases({
							default: (seq) => seq,
							multiple: () => {
								throw new Error(
									`Serialization error: The value of an entry in a map is expected to be a single item or an empty sequence. Use arrays when putting multiple values in a map. The value of the key ${keyValuePair.key.value} holds multiple items`
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
): IIterator<any[]> {
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
									`Serialization error: The value of an entry in an array is expected to be a single item or an empty sequence. Use nested arrays when putting multiple values in an array.`
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
): IIterator<any> {
	if (isSubtypeOf(value.type, { kind: BaseType.MAP, items: [] })) {
		return transformMapToObject(value as MapValue, executionParameters);
	}
	if (isSubtypeOf(value.type, { kind: BaseType.ARRAY, items: [] })) {
		return transformArrayToArray(value as ArrayValue, executionParameters);
	}
	if (isSubtypeOf(value.type, { kind: BaseType.XSQNAME })) {
		const qualifiedName = value.value as QName;
		return {
			next: () => ready(`Q{${qualifiedName.namespaceURI || ''}}${qualifiedName.localName}`),
		};
	}

	// Make it actual here
	switch (value.type.kind) {
		case BaseType.XSDATE:
		case BaseType.XSTIME:
		case BaseType.XSDATETIME:
		case BaseType.XSGYEARMONTH:
		case BaseType.XSGYEAR:
		case BaseType.XSGMONTHDAY:
		case BaseType.XSGMONTH:
		case BaseType.XSGDAY: {
			const temporalValue = value.value as DateTime;
			return {
				next: () => ready(temporalValue.toJavaScriptDate()),
			};
		}
		case BaseType.ATTRIBUTE:
		case BaseType.NODE:
		case BaseType.ELEMENT:
		case BaseType.DOCUMENTNODE:
		case BaseType.TEXT:
		case BaseType.PROCESSINGINSTRUCTION:
		case BaseType.COMMENT: {
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
