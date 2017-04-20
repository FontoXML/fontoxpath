import Duration from '../../valueTypes/Duration';

export default function durationComparator (value1, value2) {
	var value1Object = Duration.fromString(value1),
		value2Object = Duration.fromString(value2);

	return value1Object.compare(value2Object);
};
