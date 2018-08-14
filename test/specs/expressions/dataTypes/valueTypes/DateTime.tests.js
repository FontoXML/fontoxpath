import DateTime from 'fontoxpath/expressions/dataTypes/valueTypes/DateTime';
import DayTimeDuration from 'fontoxpath/expressions/dataTypes/valueTypes/DayTimeDuration';

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
});
