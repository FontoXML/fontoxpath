import * as chai from 'chai';
import * as slimdom from 'slimdom';

import {
	evaluateXPathToBoolean,
	evaluateXPathToNumber,
	evaluateXPathToNumbers,
	evaluateXPathToString,
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('numeric functions', () => {
	describe('number()', () => {
		it('accepts INF', () =>
			chai.assert.equal(evaluateXPathToNumber('number("INF")', documentNode), Infinity));

		it('accepts the empty sequence', () =>
			chai.assert.isNaN(evaluateXPathToNumber('number(())', documentNode)));

		it('accepts nodes', () => {
			documentNode.appendChild(documentNode.createElement('someElement'));
			chai.assert.isNaN(evaluateXPathToNumber('number(./text()[1])', documentNode));
		});
	});

	describe('xs:float()', () => {
		it('accepts INF', () =>
			chai.assert.equal(evaluateXPathToNumber('xs:float("INF")', documentNode), Infinity));

		it('accepts the empty sequence', () =>
			chai.assert.equal(evaluateXPathToNumber('xs:float(()) => count()', documentNode), 0));
	});

	describe('xs:double()', () => {
		it('accepts INF', () =>
			chai.assert.equal(evaluateXPathToNumber('xs:double("INF")', documentNode), Infinity));

		it('accepts the empty sequence', () =>
			chai.assert.equal(evaluateXPathToNumber('xs:double(()) => count()', documentNode), 0));
	});

	describe('xs:integer()', () => {
		it('accepts 42', () =>
			chai.assert.equal(evaluateXPathToNumber('xs:integer("42")', documentNode), 42));

		it('accepts the empty sequence', () =>
			chai.assert.equal(evaluateXPathToNumber('xs:integer(()) => count()', documentNode), 0));
	});

	describe('fn:abs()', () => {
		it('accepts 42', () =>
			chai.assert.equal(evaluateXPathToNumber('abs(xs:integer("42"))', documentNode), 42));

		it('returns the absolute value', () =>
			chai.assert.equal(
				evaluateXPathToNumber('abs(xs:int("-2147483648"))', documentNode),
				2147483648
			));
	});

	describe('fn:round', () => {
		it('returns an empty sequence when given an empty sequence', () =>
			chai.assert.deepEqual(evaluateXPathToNumbers('round(())', documentNode), []));
		it('returns NaN when given NaN', () =>
			chai.assert.isNaN(evaluateXPathToNumber('round(NaN)', documentNode)));
		it('returns -0 when given -0', () =>
			chai.assert.equal(evaluateXPathToNumber('round(-0)', documentNode), -0));
		it('returns +0 when given +0', () =>
			chai.assert.equal(evaluateXPathToNumber('round(+0)', documentNode), +0));
		it('returns -INF when given -INF', () =>
			chai.assert.equal(
				evaluateXPathToNumber('round(xs:double("-INF"))', documentNode),
				-Infinity
			));
		it('returns +INF when given +INF', () =>
			chai.assert.equal(
				evaluateXPathToNumber('round(xs:double("+INF"))', documentNode),
				+Infinity
			));

		it('returns 25 for 24.5', () =>
			chai.assert.equal(evaluateXPathToNumber('round(24.5)', documentNode), 25));
		it('returns 1 for 1, precision 2', () =>
			chai.assert.equal(evaluateXPathToNumber('round(1, 2)', documentNode), 1));
		// Fails due to javascript float inprecision
		it.skip('returns 35.43 for 35.425, precision 2', () =>
			chai.assert.equal(evaluateXPathToNumber('round(35.425, 2)', documentNode), 35.43));
		it('returns -1.7976931348623157E308 for -1.7976931348623157E308', () =>
			chai.assert.equal(
				evaluateXPathToNumber(
					'fn:round(xs:double("-1.7976931348623157E308"))',
					documentNode
				),
				-1.7976931348623157e308
			));
	});

	describe('fn:round-half-to-even', () => {
		it('returns an empty sequence when given an empty sequence', () =>
			chai.assert.deepEqual(
				evaluateXPathToNumbers('round-half-to-even(())', documentNode),
				[]
			));
		it('returns NaN when given NaN', () =>
			chai.assert.isNaN(evaluateXPathToNumber('round-half-to-even(NaN)', documentNode)));
		it('returns -0 when given -0', () =>
			chai.assert.equal(evaluateXPathToNumber('round-half-to-even(-0)', documentNode), -0));
		it('returns +0 when given +0', () =>
			chai.assert.equal(evaluateXPathToNumber('round-half-to-even(+0)', documentNode), +0));
		it('returns -INF when given -INF', () =>
			chai.assert.equal(
				evaluateXPathToNumber('round-half-to-even(xs:double("-INF"))', documentNode),
				-Infinity
			));
		it('returns +INF when given +INF', () =>
			chai.assert.equal(
				evaluateXPathToNumber('round-half-to-even(xs:double("+INF"))', documentNode),
				+Infinity
			));

		it('returns 24 for 24.5', () =>
			chai.assert.equal(evaluateXPathToNumber('round-half-to-even(24.5)', documentNode), 24));
		it('returns 26 for 25.5', () =>
			chai.assert.equal(evaluateXPathToNumber('round-half-to-even(25.5)', documentNode), 26));
		it('returns 25 for 25.2', () =>
			chai.assert.equal(evaluateXPathToNumber('round-half-to-even(25.2)', documentNode), 25));
		it('returns 25 for 24.8', () =>
			chai.assert.equal(evaluateXPathToNumber('round-half-to-even(24.8)', documentNode), 25));
		it('returns 0 for 0.5', () =>
			chai.assert.equal(evaluateXPathToNumber('round-half-to-even(0.5)', documentNode), 0));
		it('returns 2 for 1.5', () =>
			chai.assert.equal(evaluateXPathToNumber('round-half-to-even(1.5)', documentNode), 2));
		it('returns 2 for 2.5', () =>
			chai.assert.equal(evaluateXPathToNumber('round-half-to-even(2.5)', documentNode), 2));
		it('returns 24.426 for 24.42566 (precision 3)', () =>
			chai.assert.equal(
				evaluateXPathToNumber('round-half-to-even(24.42566, 3)', documentNode),
				24.426
			));

		it('returns 4561 for 4561.000005e0 (precision 0)', () =>
			chai.assert.equal(
				evaluateXPathToNumber('round-half-to-even(4561.000005e0, 0)', documentNode),
				4561
			));
		it('returns 4561234600 for 4561234567 (precision -2)', () =>
			chai.assert.equal(
				evaluateXPathToNumber('round-half-to-even(4561234567, -2)', documentNode),
				4561234600
			));
		it('returns 4561234567 for 4561234567 (precision 0)', () =>
			chai.assert.equal(
				evaluateXPathToNumber('round-half-to-even(4561234567, 0)', documentNode),
				4561234567
			));
		it.skip('returns 0.1 for 0.05 (precision 1)', () =>
			chai.assert.equal(
				evaluateXPathToNumber('round-half-to-even(xs:float("0.05"), 1)', documentNode),
				0.1
			));
		it.skip('returns -0.1 for -0.05 (precision 1)', () =>
			chai.assert.equal(
				evaluateXPathToNumber('round-half-to-even(xs:float("-0.05"), 1)', documentNode),
				-0.1
			));
		it('returns 3567.812 for 3.567812E+3 (precision 4294967296)', () =>
			chai.assert.equal(
				evaluateXPathToNumber('round-half-to-even(3.567812E+3, 4294967296)', documentNode),
				3567.812
			));
		it('returns 3.567812 for 3.567812 (precision 4294967296)', () =>
			chai.assert.equal(
				evaluateXPathToNumber('round-half-to-even(3.567812, 4294967296)', documentNode),
				3.567812
			));
	});

	describe('fn:random-number-generator', () => {
		for (let i = 0; i < 100; ++i) {
			describe(`given the random nature of randomness, run the tests multiple times! This is run ${i}`, () => {
				it('returns any random number', () =>
					chai.assert.closeTo(
						evaluateXPathToNumber('random-number-generator()?number', documentNode),
						0.5,
						0.5,
						'number should return something in the range 0 to 10'
					));

				it('returns any random number via next function', () =>
					chai.assert.closeTo(
						evaluateXPathToNumber(
							'random-number-generator()?next()?number',
							documentNode
						),
						0.5,
						0.5,
						'number should return something in the range 0 to 10'
					));

				it('permute should permute the sequence', () =>
					chai.assert.sameMembers(
						evaluateXPathToNumbers(
							'random-number-generator()?permute((1, 2, 3, 4))',
							documentNode
						),
						[1, 2, 3, 4]
					));
			});
		}
		it('throws when given a seed', () =>
			chai.assert.throws(() => evaluateXPathToBoolean('random-number-generator(123)')));
	});

	describe('fn:format-integer', () => {
		it('returns LVII for 57', () => {
			chai.assert.equal(evaluateXPathToString('format-integer(57, "I")'), 'LVII');
		});

		it('returns lvii for 57', () => {
			chai.assert.equal(evaluateXPathToString('format-integer(57, "i")'), 'lvii');
		});

		it('returns -lvii for -57', () => {
			chai.assert.equal(evaluateXPathToString('format-integer(-57, "i")'), '-lvii');
		});

		it('returns G for 7', () => {
			chai.assert.equal(evaluateXPathToString('format-integer(7, "A")'), 'G');
		});

		it('returns g for 7', () => {
			chai.assert.equal(evaluateXPathToString('format-integer(7, "a")'), 'g');
		});

		it('returns Η (eta) for 7', () => {
			chai.assert.equal(evaluateXPathToString('format-integer(7, "&#x0391;")'), 'Η');
		});

		it('returns η (eta) for 7', () => {
			chai.assert.equal(evaluateXPathToString('format-integer(7, "&#x03b1;")'), 'η');
		});

		it('returns -g for -7', () => {
			chai.assert.equal(evaluateXPathToString('format-integer(-7, "a")'), '-g');
		});

		it('returns -η (eta) for -7', () => {
			chai.assert.equal(evaluateXPathToString('format-integer(-7, "&#x03b1;")'), '-η');
		});

		it('returns AB for 28', () => {
			chai.assert.equal(evaluateXPathToString('format-integer(28, "A")'), 'AB');
		});

		it('returns ab for 28', () => {
			chai.assert.equal(evaluateXPathToString('format-integer(28, "a")'), 'ab');
		});

		it('returns ΑΔ for 28', () => {
			chai.assert.equal(evaluateXPathToString('format-integer(28, "&#x0391;")'), 'ΑΔ');
		});

		it('returns αδ for 28', () => {
			chai.assert.equal(evaluateXPathToString('format-integer(28, "&#x03b1;")'), 'αδ');
		});

		it('returns -ab for -28', () => {
			chai.assert.equal(evaluateXPathToString('format-integer(-28, "a")'), '-ab');
		});

		it('returns -αδ for -28', () => {
			chai.assert.equal(evaluateXPathToString('format-integer(28, "&#x03b1;")'), 'αδ');
		});

		it('returns - for 0', () => {
			chai.assert.equal(evaluateXPathToString('format-integer(0, "a")'), '-');
			chai.assert.equal(evaluateXPathToString('format-integer(0, "A")'), '-');
			chai.assert.equal(evaluateXPathToString('format-integer(0, "i")'), '-');
			chai.assert.equal(evaluateXPathToString('format-integer(0, "I")'), '-');
			chai.assert.equal(evaluateXPathToString('format-integer(0, "&#x03b1;")'), '-');
			chai.assert.equal(evaluateXPathToString('format-integer(0, "&#x0391;")'), '-');
		});

		it('returns "" for ()', () => {
			chai.assert.equal(evaluateXPathToString('format-integer((), "a")'), '');
			chai.assert.equal(evaluateXPathToString('format-integer((), "A")'), '');
			chai.assert.equal(evaluateXPathToString('format-integer((), "i")'), '');
			chai.assert.equal(evaluateXPathToString('format-integer((), "I")'), '');
			chai.assert.equal(evaluateXPathToString('format-integer((), "&#x03b1;")'), '');
			chai.assert.equal(evaluateXPathToString('format-integer((), "&#x0391;")'), '');
			chai.assert.equal(evaluateXPathToString('format-integer((), "arabicAbjadi")'), '');
			chai.assert.equal(
				evaluateXPathToString('format-integer((), "arabicAbjadNumeral")'),
				''
			);
			chai.assert.equal(evaluateXPathToString('format-integer((), "arabicAlifBaTa")'), '');
			chai.assert.equal(evaluateXPathToString('format-integer((), "&#x661;")'), '');
			chai.assert.equal(evaluateXPathToString('format-integer((), "hebrewAlefBet")'), '');
			chai.assert.equal(evaluateXPathToString('format-integer((), "hebrewNumeral")'), '');
			chai.assert.equal(evaluateXPathToString('format-integer((), "&#x6f1;")'), '');
		});

		it('throws for unknown pictures', () => {
			chai.assert.throw(() => {
				evaluateXPathToString('format-integer(57, "x")');
			});
		});

		const arabicAbjadi: [number, string][] = [
			[1, 'أ'],
			[2, 'ب'],
			[3, 'ج'],
			[4, 'د'],
			[5, 'ه'],
			[6, 'و'],
			[7, 'ز'],
			[8, 'ح'],
			[9, 'ط'],
			[10, 'ي'],
			[11, 'ك'],
			[12, 'ل'],
			[13, 'م'],
			[14, 'ن'],
			[15, 'س'],
			[16, 'ع'],
			[17, 'ف'],
			[18, 'ص'],
			[19, 'ق'],
			[20, 'ر'],
			[21, 'ش'],
			[22, 'ت'],
			[23, 'ث'],
			[24, 'خ'],
			[25, 'ذ'],
			[26, 'ض'],
			[27, 'ظ'],
			[28, 'غ'],
			[29, 'أ‌أ'],
			[30, 'ب‌ب'],
			[31, 'ج‌ج'],
			[32, 'د‌د'],
			[56, 'غ‌غ'],
			[57, 'أ‌أ‌أ'],
			[58, 'ب‌ب‌ب'],
			[59, 'ج‌ج‌ج'],
			[60, 'د‌د‌د'],

			[0, '-'],
			[-32, '-د‌د'],
		];

		for (const [int, expected] of arabicAbjadi) {
			it(`should format ${int} as a letter of the Arabic alphabet, sorted in Abjadi order`, () => {
				chai.assert.equal(
					evaluateXPathToString(`format-integer(${int}, "arabicAbjadi")`),
					expected
				);
			});
		}

		const abjadNumerals: [number, string][] = [
			[1000, 'غ'],
			[900, 'ظ'],
			[800, 'ض'],
			[700, 'ذ'],
			[600, 'خ'],
			[500, 'ث'],
			[400, 'ت'],
			[300, 'ش'],
			[200, 'ر'],
			[100, 'ق'],
			[90, 'ص'],
			[80, 'ف'],
			[70, 'ع'],
			[60, 'س'],
			[50, 'ن'],
			[40, 'م'],
			[30, 'ل'],
			[20, 'ك'],
			[10, 'ي'],
			[9, 'ط'],
			[8, 'ح'],
			[7, 'ز'],
			[6, 'و'],
			[5, 'ه'],
			[4, 'د'],
			[3, 'ج'],
			[2, 'ب'],
			[1, 'أ'],

			[12, 'يب'],
			[14, 'يد'],
			[16, 'يو'],
			[18, 'يح'],
			[26, 'كو'],
			[39, 'لط'],
			[58, 'نح'],
			[92, 'صب'],
			[106, 'قو'],
			[232, 'رلب'],
			[478, 'تعح'],
			[799, 'ذصط'],
			[1001, 'غأ'],
			[1999, 'غظصط'],
			[2000, 'بغ'],
			[2567, 'بغثسز'],
			[4000, 'دغ'],
			[6839, 'وغضلط'],
			[10000, 'يغ'],
			[702478, 'ذبغتعح'],

			[0, '-'],
			[-39, '-لط'],
		];

		for (const [int, expected] of abjadNumerals) {
			it(`should format ${int} as an Abjad numeral`, () => {
				chai.assert.equal(
					evaluateXPathToString(`format-integer(${int}, "arabicAbjadNumeral")`),
					expected
				);
			});
		}

		const arabicAlifBaTa: [number, string][] = [
			[1, 'ا'],
			[2, 'ب'],
			[3, 'ت'],
			[4, 'ث'],
			[5, 'ج'],
			[6, 'ح'],
			[7, 'خ'],
			[8, 'د'],
			[9, 'ذ'],
			[10, 'ر'],
			[11, 'ز'],
			[12, 'س'],
			[13, 'ش'],
			[14, 'ص'],
			[15, 'ض'],
			[16, 'ط'],
			[17, 'ظ'],
			[18, 'ع'],
			[19, 'غ'],
			[20, 'ف'],
			[21, 'ق'],
			[22, 'ك'],
			[23, 'ل'],
			[24, 'م'],
			[25, 'ن'],
			[26, 'ه'],
			[27, 'و'],
			[28, 'ي'],
			[29, 'ا‌ا'],
			[30, 'ب‌ب'],
			[31, 'ت‌ت'],
			[32, 'ث‌ث'],
			[33, 'ج‌ج'],

			[56, 'ي‌ي'],
			[57, 'ا‌ا‌ا'],
			[58, 'ب‌ب‌ب'],
			[59, 'ت‌ت‌ت'],

			[0, '-'],
			[-33, '-ج‌ج'],
		];

		for (const [int, expected] of arabicAlifBaTa) {
			it(`should format ${int} as a letter of the Arabic alphabet, sorted in AlifBaTa order`, () => {
				chai.assert.equal(
					evaluateXPathToString(`format-integer(${int}, "arabicAlifBaTa")`),
					expected
				);
			});
		}

		const hebrewAlefBet: [number, string][] = [
			[1, 'א'],
			[2, 'ב'],
			[3, 'ג'],
			[4, 'ד'],
			[5, 'ה'],
			[6, 'ו'],
			[7, 'ז'],
			[8, 'ח'],
			[9, 'ט'],
			[10, 'י'],
			[11, 'כ'],
			[12, 'ל'],
			[13, 'מ'],
			[14, 'נ'],
			[15, 'ס'],
			[16, 'ע'],
			[17, 'פ'],
			[18, 'צ'],
			[19, 'ק'],
			[20, 'ר'],
			[21, 'ש'],
			[22, 'ת'],
			[23, 'תא'],
			[24, 'תב'],
			[25, 'תג'],
			[26, 'תד'],
			[27, 'תה'],
			[28, 'תו'],

			[44, 'תת'],
			[45, 'תתא'],
			[46, 'תתב'],
			[47, 'תתג'],
			[48, 'תתד'],

			[0, '-'],
			[-45, '-תתא'],
		];

		for (const [int, expected] of hebrewAlefBet) {
			it(`should format ${int} as a letter of the Hebrew alphabet`, () => {
				chai.assert.equal(
					evaluateXPathToString(`format-integer(${int}, "hebrewAlefBet")`),
					expected
				);
			});
		}

		const hebrewNumerals: [number, string][] = [
			[1, 'א'],
			[2, 'ב'],
			[3, 'ג'],
			[4, 'ד'],
			[5, 'ה'],
			[6, 'ו'],
			[7, 'ז'],
			[8, 'ח'],
			[9, 'ט'],
			[10, 'י'],
			[11, 'יא'],
			[12, 'יב'],
			[13, 'יג'],
			[14, 'יד'],
			[15, 'טו'],
			[16, 'טז'],
			[17, 'יז'],
			[18, 'יח'],
			[19, 'יט'],
			[20, 'כ'],
			[21, 'כא'],
			[28, 'כח'],
			[30, 'ל'],
			[35, 'לה'],
			[40, 'מ'],
			[48, 'מח'],
			[50, 'נ'],
			[52, 'נב'],
			[60, 'ס'],
			[70, 'ע'],
			[80, 'פ'],
			[90, 'צ'],
			[100, 'ק'],
			[115, 'קטו'],
			[116, 'קטז'],
			[200, 'ר'],
			[300, 'ש'],
			[315, 'שטו'],
			[316, 'שטז'],
			[399, 'שצט'],
			[400, 'ת'],
			[499, 'תצט'],
			[522, 'תקכב'],
			[816, 'תתטז'],
			[833, 'תתלג'],
			[1615, 'תתתתטו'],

			[0, '-'],
			[-35, '-לה'],
		];

		for (const [int, expected] of hebrewNumerals) {
			it(`should format ${int} as a Hebrew numeral`, () => {
				chai.assert.equal(
					evaluateXPathToString(`format-integer(${int}, "hebrewNumeral")`),
					expected
				);
			});
		}

		const arabicAndPersianNumerals: [int: number, arabicNum: string, persianNum: string][] = [
			[-15, '؜-١٥', '‎-‎۱۵'],
			[0, '٠', '۰'],
			[1, '١', '۱'],
			[2, '٢', '۲'],
			[3, '٣', '۳'],
			[4, '٤', '۴'],
			[5, '٥', '۵'],
			[6, '٦', '۶'],
			[7, '٧', '۷'],
			[8, '٨', '۸'],
			[9, '٩', '۹'],
			[15, '١٥', '۱۵'],
			[2895, '٢٨٩٥', '۲۸۹۵'],
			[58973, '٥٨٩٧٣', '۵۸۹۷۳'],
			[5e4, '٥٠٠٠٠', '۵۰۰۰۰'],
		];

		for (const [int, expectedArabicNum, _] of arabicAndPersianNumerals) {
			it(`should format ${int} as an Arabic-Indic numeral using arabic-indic numeral 1 as the format string`, () => {
				chai.assert.equal(
					evaluateXPathToString(`format-integer(${int}, "&#x661;")`),
					expectedArabicNum
				);
			});

			it(`should format ${int} as an Arabic-Indic numeral using arabic-indic numeral 4 as the format string`, () => {
				chai.assert.equal(
					evaluateXPathToString(`format-integer(${int}, "&#x664;")`),
					expectedArabicNum
				);
			});
		}

		for (const [int, _, expectedPersianNum] of arabicAndPersianNumerals) {
			it(`should format ${int} as a Persian numeral using persian numeral 1 as the format string`, () => {
				chai.assert.equal(
					evaluateXPathToString(`format-integer(${int}, "&#x6f1;")`),
					expectedPersianNum
				);
			});

			it(`should format ${int} as a Persian numeral using persian numeral 4 as the format string`, () => {
				chai.assert.equal(
					evaluateXPathToString(`format-integer(${int}, "&#x6f4;")`),
					expectedPersianNum
				);
			});
		}
	});
});
