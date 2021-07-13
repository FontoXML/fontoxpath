import { NodePointer } from './domClone/Pointer';
import realizeDom from './domClone/realizeDom';
import ArrayValue, { ABSENT_JSON_ARRAY } from './expressions/dataTypes/ArrayValue';
import isSubtypeOf from './expressions/dataTypes/isSubtypeOf';
import MapValue, { AbsentJsonObject } from './expressions/dataTypes/MapValue';
import Value, { ValueType } from './expressions/dataTypes/Value';
import DateTime from './expressions/dataTypes/valueTypes/DateTime';
import QName from './expressions/dataTypes/valueTypes/QName';
import ExecutionParameters from './expressions/ExecutionParameters';
import { ValidValue } from './types/createTypedValueFactory';

export function transformMapToObject(
	map: MapValue,
	executionParameters: ExecutionParameters
): { [s: string]: ValidValue } {
	if (map.jsonObject !== AbsentJsonObject) {
		return map.jsonObject;
	}

	const mapObj: { [s: string]: ValidValue } = {};
	for (let i = 0; i < map.keyValuePairs.length; ++i) {
		// Assume the keys for a map are strings.
		const key = map.keyValuePairs[i].key.value as string;

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

		const transformedValue = transformXPathItemToJavascriptObject(val, executionParameters);
		mapObj[key] = transformedValue;
	}
	return mapObj;
}

export function transformArrayToArray(
	array: ArrayValue,
	executionParameters: ExecutionParameters
): ValidValue[] {
	if (array.jsonArray !== ABSENT_JSON_ARRAY) {
		return array.jsonArray;
	}

	const arr: ValidValue[] = [];
	for (let i = 0; i < array.members.length; ++i) {
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
			arr[i] = null;
			continue;
		}
		const transformedValue = transformXPathItemToJavascriptObject(val, executionParameters);
		arr[i] = transformedValue;
	}
	return arr;
}

export default function transformXPathItemToJavascriptObject(
	value: Value,
	executionParameters: ExecutionParameters
): ValidValue {
	if (isSubtypeOf(value.type, ValueType.MAP)) {
		return transformMapToObject(value as MapValue, executionParameters);
	}
	if (isSubtypeOf(value.type, ValueType.ARRAY)) {
		return transformArrayToArray(value as ArrayValue, executionParameters);
	}
	if (isSubtypeOf(value.type, ValueType.XSQNAME)) {
		const qualifiedName = value.value as QName;
		return `Q{${qualifiedName.namespaceURI || ''}}${qualifiedName.localName}`;
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
			return temporalValue.toJavaScriptDate();
		}
		case ValueType.ATTRIBUTE:
		case ValueType.NODE:
		case ValueType.ELEMENT:
		case ValueType.DOCUMENTNODE:
		case ValueType.TEXT:
		case ValueType.PROCESSINGINSTRUCTION:
		case ValueType.COMMENT: {
			const nodeValue = value.value as NodePointer;
			return realizeDom(nodeValue, executionParameters, false);
		}

		default:
			return value.value;
	}
}
