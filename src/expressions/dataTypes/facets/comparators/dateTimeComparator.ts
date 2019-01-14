import DateTime, { compare } from '../../valueTypes/DateTime';

export default function dateTimeComparator(value1, value2) {
	const value1Object = DateTime.fromString(value1),
		value2Object = DateTime.fromString(value2);

	return compare(value1Object, value2Object);
}
