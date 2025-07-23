import * as chai from 'chai';
import DateTime, {
	addDuration,
	subtractDuration,
} from 'fontoxpath/expressions/dataTypes/valueTypes/DateTime';
import DayTimeDuration from 'fontoxpath/expressions/dataTypes/valueTypes/DayTimeDuration';
import Duration from 'fontoxpath/expressions/dataTypes/valueTypes/Duration';

describe('Data type: dateTime', () => {
	describe('DateTime.fromString()', () => {
		it('accepts "2000-12-12T20:10:10.2" as input', () => {
			const dateTime = DateTime.fromString('2000-12-12T20:10:10.2');
			chai.assert.deepEqual(dateTime, new DateTime(2000, 12, 12, 20, 10, 10, 0.2, null));
		});

		it('accepts "20000-12-12T20:10:10.2" as input', () => {
			const dateTime = DateTime.fromString('20000-12-12T20:10:10.2');
			chai.assert.deepEqual(dateTime, new DateTime(20000, 12, 12, 20, 10, 10, 0.2, null));
		});

		it('accepts "-2000-12-12T20:10:10.2" as input', () => {
			const dateTime = DateTime.fromString('2000-12-12T20:10:10.2');
			chai.assert.deepEqual(dateTime, new DateTime(2000, 12, 12, 20, 10, 10, 0.2, null));
		});

		it('accepts "2000-12-12T20:10:10.2Z" as input', () => {
			const dateTime = DateTime.fromString('2000-12-12T20:10:10.2Z');
			chai.assert.deepEqual(
				dateTime,
				new DateTime(
					2000,
					12,
					12,
					20,
					10,
					10,
					0.2,
					DayTimeDuration.fromTimezoneString('Z'),
				),
			);
		});

		it('accepts "2000-12-12T20:10:10.2+10:00" as input', () => {
			const dateTime = DateTime.fromString('2000-12-12T20:10:10.2+10:00');
			chai.assert.deepEqual(
				dateTime,
				new DateTime(
					2000,
					12,
					12,
					20,
					10,
					10,
					0.2,
					DayTimeDuration.fromTimezoneString('+10:00'),
				),
			);
		});

		it('addDuration "P1Y2M" to "1999-12-31T23:00:00+10:00"', () => {
			const dateTime = DateTime.fromString('1999-12-31T23:00:00+10:00');
			const duration = Duration.fromString('P1Y2M');
			const newDateTime = addDuration(dateTime, duration);
			chai.assert.deepEqual(
				newDateTime,
				new DateTime(
					2001,
					2,
					28,
					23,
					0,
					0,
					0,
					DayTimeDuration.fromTimezoneString('+10:00'),
				),
			);
		});

		it('addDuration "P3DT1H15M" to "1999-12-31T23:00:00+10:00"', () => {
			const dateTime = DateTime.fromString('1999-12-31T23:00:00+10:00');
			const duration = Duration.fromString('P3DT1H15M');
			const newDateTime = addDuration(dateTime, duration);
			chai.assert.deepEqual(
				newDateTime,
				// eslint-disable-next-line prettier/prettier
				new DateTime(
					2000,
					1,
					4,
					0,
					15,
					0,
					0,
					DayTimeDuration.fromTimezoneString('+10:00'),
				),
			);
		});

		it('addDuration "PT505H" to "1999-12-31T23:00:00+10:00"', () => {
			const dateTime = DateTime.fromString('1999-12-31T23:00:00+10:00');
			const duration = Duration.fromString('PT505H');
			const newDateTime = addDuration(dateTime, duration);
			chai.assert.deepEqual(
				newDateTime,
				// eslint-disable-next-line prettier/prettier
				new DateTime(
					2000,
					1,
					22,
					0,
					0,
					0,
					0,
					DayTimeDuration.fromTimezoneString('+10:00'),
				),
			);
		});

		it('addDuration "P60D" to "1999-12-31T23:00:00+10:00"', () => {
			const dateTime = DateTime.fromString('1999-12-31T23:00:00+10:00');
			const duration = Duration.fromString('P60D');
			const newDateTime = addDuration(dateTime, duration);
			chai.assert.deepEqual(
				newDateTime,
				// eslint-disable-next-line prettier/prettier
				new DateTime(
					2000,
					2,
					29,
					23,
					0,
					0,
					0,
					DayTimeDuration.fromTimezoneString('+10:00'),
				),
			);
		});

		it('addDuration with negative "-P3DT1H15M" to "2000-01-04T00:15:00+10:00"', () => {
			const dateTime = DateTime.fromString('2000-01-04T00:15:00+10:00');
			const duration = Duration.fromString('-P3DT1H15M');
			const newDateTime = addDuration(dateTime, duration);
			chai.assert.deepEqual(
				newDateTime,
				new DateTime(
					1999,
					12,
					31,
					23,
					0,
					0,
					0,
					DayTimeDuration.fromTimezoneString('+10:00'),
				),
			);
		});

		it('subDuration "P1Y2M" from "2001-02-28T23:00:00+10:00"', () => {
			const dateTime = DateTime.fromString('2001-02-28T23:00:00+10:00');
			const duration = Duration.fromString('P1Y2M');
			const newDateTime = subtractDuration(dateTime, duration);
			chai.assert.deepEqual(
				newDateTime,
				new DateTime(
					1999,
					12,
					31,
					23,
					0,
					0,
					0,
					DayTimeDuration.fromTimezoneString('+10:00'),
				),
			);
		});
		it('subDuration "P3DT1H15M" from "2000-01-04T00:15:00+10:00"', () => {
			const dateTime = DateTime.fromString('2000-01-04T00:15:00+10:00');
			const duration = Duration.fromString('P3DT1H15M');
			const newDateTime = subtractDuration(dateTime, duration);
			chai.assert.deepEqual(
				newDateTime,
				new DateTime(
					1999,
					12,
					31,
					23,
					0,
					0,
					0,
					DayTimeDuration.fromTimezoneString('+10:00'),
				),
			);
		});

		it('subDuration negativ "-P3DT1H15M" to "1999-12-31T23:00:00+10:00"', () => {
			const dateTime = DateTime.fromString('1999-12-31T23:00:00+10:00');
			const duration = Duration.fromString('-P3DT1H15M');
			const newDateTime = subtractDuration(dateTime, duration);
			chai.assert.deepEqual(
				newDateTime,
				// eslint-disable-next-line prettier/prettier
				new DateTime(
					2000,
					1,
					4,
					0,
					15,
					0,
					0,
					DayTimeDuration.fromTimezoneString('+10:00'),
				),
			);
		});
	});
	it('subDuration "PT505H" to "2000-01-22T00:00:00+10:00"', () => {
		const dateTime = DateTime.fromString('2000-01-22T00:00:00+10:00');
		const duration = Duration.fromString('PT505H');
		const newDateTime = subtractDuration(dateTime, duration);
		chai.assert.deepEqual(
			newDateTime,
			// eslint-disable-next-line prettier/prettier
			new DateTime(
				1999,
				12,
				31,
				23,
				0,
				0,
				0,
				DayTimeDuration.fromTimezoneString('+10:00'),
			),
		);
	});

	it('subDuration "P60D" to "2000-02-29T23:00:00+10:00"', () => {
		const dateTime = DateTime.fromString('2000-02-29T23:00:00+10:00');
		const duration = Duration.fromString('P60D');
		const newDateTime = subtractDuration(dateTime, duration);
		chai.assert.deepEqual(
			newDateTime,
			// eslint-disable-next-line prettier/prettier
			new DateTime(
				1999,
				12,
				31,
				23,
				0,
				0,
				0,
				DayTimeDuration.fromTimezoneString('+10:00'),
			),
		);
	});
});
