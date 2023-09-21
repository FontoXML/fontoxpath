import { NodePointer } from './domClone/Pointer';
import realizeDom from './domClone/realizeDom';
import ArrayValue from './expressions/dataTypes/ArrayValue';
import isSubtypeOf from './expressions/dataTypes/isSubtypeOf';
import MapValue from './expressions/dataTypes/MapValue';
import Value, { ValueType } from './expressions/dataTypes/Value';
import DateTime from './expressions/dataTypes/valueTypes/DateTime';
import QName from './expressions/dataTypes/valueTypes/QName';
import ExecutionParameters from './expressions/ExecutionParameters';
import { DONE_TOKEN, IIterator, IterationHint, ready } from './expressions/util/iterators';

export function transformMapToObject(
	map: MapValue,
	executionParameters: ExecutionParameters,
): IIterator<object> {
	const mapObj: { [s: string]: Value } = {};
	let i = 0;
	let done = false;
	let transformedValueIterator: IIterator<Value> = null;
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
									`Serialization error: The value of an entry in a map is expected to be a single item or an empty sequence. Use arrays when putting multiple values in a map. The value of the key ${keyValuePair.key.value} holds multiple items`,
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
						executionParameters,
					);
				}
				const transformedValue = transformedValueIterator.next(IterationHint.NONE);
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
	executionParameters: ExecutionParameters,
): IIterator<any[]> {
	const arr: Value[] = [];
	let i = 0;
	let done = false;
	let transformedMemberGenerator: IIterator<Value> = null;
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
									`Serialization error: The value of an entry in an array is expected to be a single item or an empty sequence. Use nested arrays when putting multiple values in an array.`,
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
						executionParameters,
					);
				}
				const transformedValue = transformedMemberGenerator.next(IterationHint.NONE);
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
	executionParameters: ExecutionParameters,
): IIterator<any> {
	if (isSubtypeOf(value.type, ValueType.MAP)) {
		return transformMapToObject(value as MapValue, executionParameters);
	}
	if (isSubtypeOf(value.type, ValueType.ARRAY)) {
		return transformArrayToArray(value as ArrayValue, executionParameters);
	}
	if (isSubtypeOf(value.type, ValueType.XSQNAME)) {
		const qualifiedName = value.value as QName;
		return {
			next: () => ready(`Q{${qualifiedName.namespaceURI || ''}}${qualifiedName.localName}`),
		};
	}

	// Make it actual here
	switch (value.type) {
		case ValueType.XSDATE:
		case ValueType.XSTIME:
		case ValueType.XSDATETIME:
		case ValueType.XSGYEARMONTH:
		case ValueType.XSGYEAR:
		case ValueType.XSGMONTHDAY:
		case ValueType.XSGMONTH:
		case ValueType.XSGDAY: {
			const temporalValue = value.value as DateTime;
			return {
				next: () => ready(temporalValue.toJavaScriptDate()),
			};
		}
		case ValueType.ATTRIBUTE:
		case ValueType.NODE:
		case ValueType.ELEMENT:
		case ValueType.DOCUMENTNODE:
		case ValueType.TEXT:
		case ValueType.PROCESSINGINSTRUCTION:
		case ValueType.COMMENT: {
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
