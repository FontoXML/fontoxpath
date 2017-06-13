import DateTime from 'fontoxpath/selectors/dataTypes/valueTypes/DateTime';
import DayTimeDuration from 'fontoxpath/selectors/dataTypes/valueTypes/DayTimeDuration';

describe('Data type: dateTime', () => {
	describe('DateTime.fromString()', () => {
		it('accepts "2000-12-12T20:10:10.2" as input', () => {
			const dateTime = DateTime.fromString('2000-12-12T20:10:10.2');
			chai.assert.deepEqual(dateTime, new DateTime(2000, 12, 12, 20, 10, 10, .2, null));
		});

		it('accepts "20000-12-12T20:10:10.2" as input', () => {
			const dateTime = DateTime.fromString('20000-12-12T20:10:10.2');
			chai.assert.deepEqual(dateTime, new DateTime(20000, 12, 12, 20, 10, 10, .2, null));
		});

		it('accepts "-2000-12-12T20:10:10.2" as input', () => {
			const dateTime = DateTime.fromString('2000-12-12T20:10:10.2');
			chai.assert.deepEqual(dateTime, new DateTime(2000, 12, 12, 20, 10, 10, .2, null));
		});

		it('accepts "2000-12-12T20:10:10.2Z" as input', () => {
			const dateTime = DateTime.fromString('2000-12-12T20:10:10.2Z');
			chai.assert.deepEqual(dateTime, new DateTime(2000, 12, 12, 20, 10, 10, .2, DayTimeDuration.fromTimezoneString('Z')));
		});

		it('accepts "2000-12-12T20:10:10.2+10:00" as input', () => {
			const dateTime = DateTime.fromString('2000-12-12T20:10:10.2+10:00');
			chai.assert.deepEqual(dateTime, new DateTime(2000, 12, 12, 20, 10, 10, .2, DayTimeDuration.fromTimezoneString('+10:00')));
		});
	});

	describe('DateTime.normalize()', () => {
		it('correctly normalizes "2000-12-12T12:00:00+10:00" to 2000-12-12T02:00:00Z', () => {
			const dateTime = DateTime.fromString('2000-12-12T12:00:00+10:00');
			chai.assert.deepEqual(dateTime.normalize(), new DateTime(2000, 12, 12, 2, 0, 0, 0, DayTimeDuration.fromTimezoneString('Z')));
		});

		it('correctly normalizes "2001-01-01T08:00:00+10:00" to 2000-12-31T22:00:00Z', () => {
			const dateTime = DateTime.fromString('2001-01-01T08:00:00+10:00');
			chai.assert.deepEqual(dateTime.normalize(), new DateTime(2000, 12, 31, 22, 0, 0, 0, DayTimeDuration.fromTimezoneString('Z')));
		});

		it('correctly normalizes "2000-12-12T12:00:00-10:00" to 2000-12-12T02:00:00Z', () => {
			const dateTime = DateTime.fromString('2000-12-12T12:00:00-10:00');
			chai.assert.deepEqual(dateTime.normalize(), new DateTime(2000, 12, 12, 22, 0, 0, 0, DayTimeDuration.fromTimezoneString('Z')));
		});

		it('correctly normalizes "2000-12-31T22:00:00-10:00" to 2001-01-01T08:00:00Z', () => {
			const dateTime = DateTime.fromString('2000-12-31T22:00:00-10:00');
			chai.assert.deepEqual(dateTime.normalize(), new DateTime(2001, 1, 1, 8, 0, 0, 0, DayTimeDuration.fromTimezoneString('Z')));
		});

		it('returns this when no timezone is set', () => {
			const dateTime = DateTime.fromString('2000-10-10T10:10:00');
			chai.assert.equal(dateTime.normalize(), dateTime);
		});

		it('returns this when timezone is already Z', () => {
			const dateTime = DateTime.fromString('2000-10-10T10:10:00Z');
			chai.assert.equal(dateTime.normalize(), dateTime);
		});
	});

	describe('DateTime.compare()', () => {
		it('returns 0 for two equal dateTimes (2000-10-10T10:10:10.5 and 2000-10-10T10:10:10.5)', () => {
			const dateTime1 = DateTime.fromString('2000-10-10T10:10:10.5'),
				dateTime2 = DateTime.fromString('2000-10-10T10:10:10.5');
			chai.assert.equal(dateTime1.compare(dateTime2), 0);
			chai.assert.equal(dateTime2.compare(dateTime1), 0);
		});

		it('returns 1 and -1 for two unequal dateTimes (2001-10-10T10:10:10.5 and 2000-10-10T10:10:10.5)', () => {
			const dateTime1 = DateTime.fromString('2001-10-10T10:10:10.5'),
				dateTime2 = DateTime.fromString('2000-10-10T10:10:10.5');
			chai.assert.equal(dateTime1.compare(dateTime2), 1);
			chai.assert.equal(dateTime2.compare(dateTime1), -1);
		});
		it('returns 1 and -1 for two unequal dateTimes (2000-11-10T10:10:10.5 and 2000-10-10T10:10:10.5)', () => {
			const dateTime1 = DateTime.fromString('2000-11-10T10:10:10.5'),
				dateTime2 = DateTime.fromString('2000-10-10T10:10:10.5');
			chai.assert.equal(dateTime1.compare(dateTime2), 1);
			chai.assert.equal(dateTime2.compare(dateTime1), -1);
		});
		it('returns 1 and -1 for two unequal dateTimes (2000-10-11T10:10:10.5 and 2000-10-10T10:10:10.5)', () => {
			const dateTime1 = DateTime.fromString('2000-10-11T10:10:10.5'),
				dateTime2 = DateTime.fromString('2000-10-10T10:10:10.5');
			chai.assert.equal(dateTime1.compare(dateTime2), 1);
			chai.assert.equal(dateTime2.compare(dateTime1), -1);
		});
		it('returns 1 and -1 for two unequal dateTimes (2000-10-10T11:10:10.5 and 2000-10-10T10:10:10.5)', () => {
			const dateTime1 = DateTime.fromString('2000-10-10T11:10:10.5'),
				dateTime2 = DateTime.fromString('2000-10-10T10:10:10.5');
			chai.assert.equal(dateTime1.compare(dateTime2), 1);
			chai.assert.equal(dateTime2.compare(dateTime1), -1);
		});
		it('returns 1 and -1 for two unequal dateTimes (2000-10-10T10:11:10.5 and 2000-10-10T10:10:10.5)', () => {
			const dateTime1 = DateTime.fromString('2000-10-10T10:11:10.5'),
				dateTime2 = DateTime.fromString('2000-10-10T10:10:10.5');
			chai.assert.equal(dateTime1.compare(dateTime2), 1);
			chai.assert.equal(dateTime2.compare(dateTime1), -1);
		});
		it('returns 1 and -1 for two unequal dateTimes (2000-10-10T10:10:11.5 and 2000-10-10T10:10:10.5)', () => {
			const dateTime1 = DateTime.fromString('2000-10-10T10:10:11.5'),
				dateTime2 = DateTime.fromString('2000-10-10T10:10:10.5');
			chai.assert.equal(dateTime1.compare(dateTime2), 1);
			chai.assert.equal(dateTime2.compare(dateTime1), -1);
		});
		it('returns 1 and -1 for two unequal dateTimes (2000-10-10T10:10:10.6 and 2000-10-10T10:10:10.5)', () => {
			const dateTime1 = DateTime.fromString('2000-10-10T10:10:10.6'),
				dateTime2 = DateTime.fromString('2000-10-10T10:10:10.5');
			chai.assert.equal(dateTime1.compare(dateTime2), 1);
			chai.assert.equal(dateTime2.compare(dateTime1), -1);
		});

		it('returns 1 and -1 for two unequal dateTimes with timezone Z (2001-10-10T10:10:10.5Z and 2000-10-10T10:10:10.5Z)', () => {
			const dateTime1 = DateTime.fromString('2001-10-10T10:10:10.5Z'),
				dateTime2 = DateTime.fromString('2000-10-10T10:10:10.5Z');
			chai.assert.equal(dateTime1.compare(dateTime2), 1);
			chai.assert.equal(dateTime2.compare(dateTime1), -1);
		});
		it('returns 1 and -1 for two unequal dateTimes with timezone +10:00 (2001-10-10T10:10:10.5+10:00 and 2000-10-10T10:10:10.5+10:00)', () => {
			const dateTime1 = DateTime.fromString('2001-10-10T10:10:10.5+10:00'),
				dateTime2 = DateTime.fromString('2000-10-10T10:10:10.5+10:00');
			chai.assert.equal(dateTime1.compare(dateTime2), 1);
			chai.assert.equal(dateTime2.compare(dateTime1), -1);
		});
		it('returns 1 and -1 for two unequal dateTimes with timezone -10:00 (2001-10-10T10:10:10.5-10:00 and 2000-10-10T10:10:10.5-10:00)', () => {
			const dateTime1 = DateTime.fromString('2001-10-10T10:10:10.5-10:00'),
				dateTime2 = DateTime.fromString('2000-10-10T10:10:10.5-10:00');
			chai.assert.equal(dateTime1.compare(dateTime2), 1);
			chai.assert.equal(dateTime2.compare(dateTime1), -1);
		});
		it('returns 0 for two equal dateTimes with different timezones (2000-10-10T00:10:10.5-10:00 and 2000-10-10T20:10:10.5+10:00)', () => {
			const dateTime1 = DateTime.fromString('2000-10-10T00:10:10.5-10:00'),
				dateTime2 = DateTime.fromString('2000-10-10T20:10:10.5+10:00');
			chai.assert.equal(dateTime1.compare(dateTime2), 0);
			chai.assert.equal(dateTime2.compare(dateTime1), 0);
		});
		it('returns 1 and -1 for two unequal dateTimes with different timezones (2000-10-10T10:10:10.5-10:00 and 2000-10-10T22:10:10.5+10:00)', () => {
			const dateTime1 = DateTime.fromString('2000-10-10T10:10:10.5-10:00'),
				dateTime2 = DateTime.fromString('2000-10-10T22:10:10.5+10:00');
			chai.assert.equal(dateTime1.compare(dateTime2), 1);
			chai.assert.equal(dateTime2.compare(dateTime1), -1);
		});
		it('returns 1 and -1 for two unequal dateTimes with timezone on the biggest value (2001-10-10T10:10:10.5+10:00 and 2000-10-10T10:10:10.5)', () => {
			const dateTime1 = DateTime.fromString('2001-10-10T10:10:10.5'),
				dateTime2 = DateTime.fromString('2000-10-10T10:10:10.5+10:00');
			chai.assert.equal(dateTime1.compare(dateTime2), 1);
			chai.assert.equal(dateTime2.compare(dateTime1), -1);
		});
		it('returns 1 and -1 for two unequal dateTimes with timezone on the smallest value (2001-10-10T10:10:10.5 and 2000-10-10T10:10:10.5+10:00)', () => {
			const dateTime1 = DateTime.fromString('2001-10-10T10:10:10.5+10:00'),
				dateTime2 = DateTime.fromString('2000-10-10T10:10:10.5');
			chai.assert.equal(dateTime1.compare(dateTime2), 1);
			chai.assert.equal(dateTime2.compare(dateTime1), -1);
		});

		it('returns undefined (indeterminate) for two unequal dateTimes with timezone on the biggest value (2000-10-10T10:10:10.5+10:00 and 2000-10-10T10:10:10.5)', () => {
			const dateTime1 = DateTime.fromString('2000-10-10T10:10:10.5'),
				dateTime2 = DateTime.fromString('2000-10-10T10:10:10.5+10:00');
			chai.assert.equal(dateTime1.compare(dateTime2), undefined);
			chai.assert.equal(dateTime2.compare(dateTime1), undefined);
		});
		it('returns undefined (indeterminate) for two unequal dateTimes with timezone on the smallest value (2000-10-10T10:10:10.5 and 2000-10-10T10:10:10.5+10:00)', () => {
			const dateTime1 = DateTime.fromString('2000-10-10T10:10:10.5+10:00'),
				dateTime2 = DateTime.fromString('2000-10-10T10:10:10.5');
			chai.assert.equal(dateTime1.compare(dateTime2), undefined);
			chai.assert.equal(dateTime2.compare(dateTime1), undefined);
		});
	});
});
