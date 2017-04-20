import DateTime from '../../valueTypes/DateTime';

export default function dateTimeComparator (value1, value2) {
	var value1Object = DateTime.fromString(value1),
	value2Object = DateTime.fromString(value2);

	return value1Object.compare(value2Object);
}
