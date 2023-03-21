import * as chai from 'chai';
import Duration from 'fontoxpath/expressions/dataTypes/valueTypes/Duration';

describe('Data type: duration', () => {
	describe('Duration.compare()', () => {
		it('returns 0 for two equal durations ("P1Y" and "P1Y")', () => {
			const duration1 = Duration.fromString('P1Y');
			const duration2 = Duration.fromString('P1Y');
			chai.assert.equal(duration1.compare(duration2), 0);
			chai.assert.equal(duration2.compare(duration1), 0);
		});
		it('returns 0 for two equal durations ("P1M" and "P1M")', () => {
			const duration1 = Duration.fromString('P1M');
			const duration2 = Duration.fromString('P1M');
			chai.assert.equal(duration1.compare(duration2), 0);
			chai.assert.equal(duration2.compare(duration1), 0);
		});
		it('returns 0 for two equal durations ("P1D" and "P1D")', () => {
			const duration1 = Duration.fromString('P1D');
			const duration2 = Duration.fromString('P1D');
			chai.assert.equal(duration1.compare(duration2), 0);
			chai.assert.equal(duration2.compare(duration1), 0);
		});
		it('returns 0 for two equal durations ("PT1H" and "PT1H")', () => {
			const duration1 = Duration.fromString('PT1H');
			const duration2 = Duration.fromString('PT1H');
			chai.assert.equal(duration1.compare(duration2), 0);
			chai.assert.equal(duration2.compare(duration1), 0);
		});
		it('returns 0 for two equal durations ("PT1M" and "PT1M")', () => {
			const duration1 = Duration.fromString('PT1M');
			const duration2 = Duration.fromString('PT1M');
			chai.assert.equal(duration1.compare(duration2), 0);
			chai.assert.equal(duration2.compare(duration1), 0);
		});
		it('returns 0 for two equal durations ("PT1S" and "PT1S")', () => {
			const duration1 = Duration.fromString('PT1S');
			const duration2 = Duration.fromString('PT1S');
			chai.assert.equal(duration1.compare(duration2), 0);
			chai.assert.equal(duration2.compare(duration1), 0);
		});
		it('returns 0 for two equal durations ("P1Y1M1DT1H1M1.1S" and "P1Y1M1DT1H1M1.1S")', () => {
			const duration1 = Duration.fromString('P1Y1M1DT1H1M1.1S');
			const duration2 = Duration.fromString('P1Y1M1DT1H1M1.1S');
			chai.assert.equal(duration1.compare(duration2), 0);
			chai.assert.equal(duration2.compare(duration1), 0);
		});

		it('returns 1 and -1 for two unequal durations ("P1Y" and "-P1Y")', () => {
			const duration1 = Duration.fromString('P1Y');
			const duration2 = Duration.fromString('-P1Y');
			chai.assert.equal(duration1.compare(duration2), 1);
			chai.assert.equal(duration2.compare(duration1), -1);
		});
		it('returns 1 and -1 for two unequal durations ("P2Y" and "P1Y")', () => {
			const duration1 = Duration.fromString('P2Y');
			const duration2 = Duration.fromString('P1Y');
			chai.assert.equal(duration1.compare(duration2), 1);
			chai.assert.equal(duration2.compare(duration1), -1);
		});
		it('returns 1 and -1 for two unequal durations ("P2M" and "P1M")', () => {
			const duration1 = Duration.fromString('P2M');
			const duration2 = Duration.fromString('P1M');
			chai.assert.equal(duration1.compare(duration2), 1);
			chai.assert.equal(duration2.compare(duration1), -1);
		});
		it('returns 1 and -1 for two unequal durations ("P2D" and "P1D")', () => {
			const duration1 = Duration.fromString('P2D');
			const duration2 = Duration.fromString('P1D');
			chai.assert.equal(duration1.compare(duration2), 1);
			chai.assert.equal(duration2.compare(duration1), -1);
		});
		it('returns 1 and -1 for two unequal durations ("PT2H" and "PT1H")', () => {
			const duration1 = Duration.fromString('PT2H');
			const duration2 = Duration.fromString('PT1H');
			chai.assert.equal(duration1.compare(duration2), 1);
			chai.assert.equal(duration2.compare(duration1), -1);
		});
		it('returns 1 and -1 for two unequal durations ("PT2M" and "PT1M")', () => {
			const duration1 = Duration.fromString('PT2M');
			const duration2 = Duration.fromString('PT1M');
			chai.assert.equal(duration1.compare(duration2), 1);
			chai.assert.equal(duration2.compare(duration1), -1);
		});
		it('returns 1 and -1 for two unequal durations ("PT2S" and "PT1S")', () => {
			const duration1 = Duration.fromString('PT2S');
			const duration2 = Duration.fromString('PT1S');
			chai.assert.equal(duration1.compare(duration2), 1);
			chai.assert.equal(duration2.compare(duration1), -1);
		});

		it('returns 1 and -1 for two unequal durations ("-P1Y" and "-P2Y")', () => {
			const duration1 = Duration.fromString('-P1Y');
			const duration2 = Duration.fromString('-P2Y');
			chai.assert.equal(duration1.compare(duration2), 1);
			chai.assert.equal(duration2.compare(duration1), -1);
		});
		it('returns 1 and -1 for two unequal durations ("-P1M" and "-P2M")', () => {
			const duration1 = Duration.fromString('-P1M');
			const duration2 = Duration.fromString('-P2M');
			chai.assert.equal(duration1.compare(duration2), 1);
			chai.assert.equal(duration2.compare(duration1), -1);
		});
		it('returns 1 and -1 for two unequal durations ("-P1D" and "-P2D")', () => {
			const duration1 = Duration.fromString('-P1D');
			const duration2 = Duration.fromString('-P2D');
			chai.assert.equal(duration1.compare(duration2), 1);
			chai.assert.equal(duration2.compare(duration1), -1);
		});
		it('returns 1 and -1 for two unequal durations ("-PT1H" and "-PT2H")', () => {
			const duration1 = Duration.fromString('-PT1H');
			const duration2 = Duration.fromString('-PT2H');
			chai.assert.equal(duration1.compare(duration2), 1);
			chai.assert.equal(duration2.compare(duration1), -1);
		});
		it('returns 1 and -1 for two unequal durations ("-PT1M" and "-PT2M")', () => {
			const duration1 = Duration.fromString('-PT1M');
			const duration2 = Duration.fromString('-PT2M');
			chai.assert.equal(duration1.compare(duration2), 1);
			chai.assert.equal(duration2.compare(duration1), -1);
		});
		it('returns 1 and -1 for two unequal durations ("-PT1S" and "-PT2S")', () => {
			const duration1 = Duration.fromString('-PT1S');
			const duration2 = Duration.fromString('-PT2S');
			chai.assert.equal(duration1.compare(duration2), 1);
			chai.assert.equal(duration2.compare(duration1), -1);
		});

		it('returns 1 and -1 for two unequal durations ("P1Y" and "P364D")', () => {
			const duration1 = Duration.fromString('P1Y');
			const duration2 = Duration.fromString('P364D');
			chai.assert.equal(duration1.compare(duration2), 1);
			chai.assert.equal(duration2.compare(duration1), -1);
		});
		it('returns undefined (indeterminate) for two durations ("P1Y" and "P365D")', () => {
			const duration1 = Duration.fromString('P1Y');
			const duration2 = Duration.fromString('P365D');
			chai.assert.equal(duration1.compare(duration2), undefined);
			chai.assert.equal(duration2.compare(duration1), undefined);
		});
		it('returns undefined (indeterminate) for two durations ("P1Y" and "P366D")', () => {
			const duration1 = Duration.fromString('P1Y');
			const duration2 = Duration.fromString('P366D');
			chai.assert.equal(duration1.compare(duration2), undefined);
			chai.assert.equal(duration2.compare(duration1), undefined);
		});
		it('returns 1 and -1 for two unequal durations ("P1Y" and "P367D")', () => {
			const duration1 = Duration.fromString('P1Y');
			const duration2 = Duration.fromString('P367D');
			chai.assert.equal(duration1.compare(duration2), -1);
			chai.assert.equal(duration2.compare(duration1), 1);
		});

		it('returns 1 and -1 for two unequal durations ("P1M" and "P27D")', () => {
			const duration1 = Duration.fromString('P1M');
			const duration2 = Duration.fromString('P27D');
			chai.assert.equal(duration1.compare(duration2), 1);
			chai.assert.equal(duration2.compare(duration1), -1);
		});
		it('returns undefined (indeterminate) for two durations ("P1M" and "P28D")', () => {
			const duration1 = Duration.fromString('P1M');
			const duration2 = Duration.fromString('P28D');
			chai.assert.equal(duration1.compare(duration2), undefined);
			chai.assert.equal(duration2.compare(duration1), undefined);
		});
		it('returns undefined (indeterminate) for two durations ("P1M" and "P29D")', () => {
			const duration1 = Duration.fromString('P1M');
			const duration2 = Duration.fromString('P29D');
			chai.assert.equal(duration1.compare(duration2), undefined);
			chai.assert.equal(duration2.compare(duration1), undefined);
		});
		it('returns undefined (indeterminate) for two durations ("P1M" and "P30D")', () => {
			const duration1 = Duration.fromString('P1M');
			const duration2 = Duration.fromString('P30D');
			chai.assert.equal(duration1.compare(duration2), undefined);
			chai.assert.equal(duration2.compare(duration1), undefined);
		});
		it('returns undefined (indeterminate) for two durations ("P1M" and "P31D")', () => {
			const duration1 = Duration.fromString('P1M');
			const duration2 = Duration.fromString('P31D');
			chai.assert.equal(duration1.compare(duration2), undefined);
			chai.assert.equal(duration2.compare(duration1), undefined);
		});
		it('returns 1 and -1 for two unequal durations ("P1M" and "P32D")', () => {
			const duration1 = Duration.fromString('P1M');
			const duration2 = Duration.fromString('P32D');
			chai.assert.equal(duration1.compare(duration2), -1);
			chai.assert.equal(duration2.compare(duration1), 1);
		});

		it('returns undefined (indeterminate) for two durations ("P1M10D" and "P1M9D")', () => {
			const duration1 = Duration.fromString('P1M10D');
			const duration2 = Duration.fromString('P1M9D');
			chai.assert.equal(duration1.compare(duration2), undefined);
			chai.assert.equal(duration2.compare(duration1), undefined);
		});
		it('returns 0 for two equal durations ("P1461D" and "P4Y")', () => {
			const duration1 = Duration.fromString('P1461D');
			const duration2 = Duration.fromString('P4Y');
			chai.assert.equal(duration1.compare(duration2), 0);
			chai.assert.equal(duration2.compare(duration1), 0);
		});
	});
});
