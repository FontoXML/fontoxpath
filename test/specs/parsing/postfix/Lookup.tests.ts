import * as chai from 'chai';
import { evaluateXPathToBoolean, evaluateXPathToString } from 'fontoxpath';

describe('lookup operator', () => {
	describe('unary lookup', () => {
		const daysMap =
			'map {1 : "Sunday", "Mo" : "Monday", "Tu" : "Tuesday", "We" : "Wednesday", "Th" : "Thursday", "Fr" : "Friday", "Sa" : "Saturday"}';
		const daysArray =
			'["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]';

		it('is equivalent to .(KS), if the KeySpecifier is a NCName and the context item is a map', () => {
			chai.assert.isTrue(evaluateXPathToBoolean(`${daysMap}("Mo") = ${daysMap}?Mo`));
		});

		it('is equivalent to .(KS), if the KeySpecifier is an IntegerLiteral and the context item is a map', () => {
			chai.assert.isTrue(evaluateXPathToBoolean(`${daysMap}?1 = ${daysMap}(1)`));
		});

		it("is equivalent to 'for $k in fn:data(KS) return .($k)', if the KeySpecifier is a ParenthesizedExpr and the context item is a map", () => {
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					`let $ks := "Mo", $res1 := ${daysMap}?($ks), $res2 := for $k in fn:data($ks) return ${daysMap}($k) return $res1=$res2`
				)
			);
		});

		it('is equivalent to \'for $k in map:keys(.) return .($k)\', if the KeySpecifier is a wildcard ("*") and the context item is a map', () => {
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					`deep-equal(${daysMap}?*, for $k in map:keys(${daysMap}) return ${daysMap}($k))`
				)
			);
		});

		it('throws XPTY0004 error, if the KeySpecifier is a NCName and the context item is an array', () => {
			chai.assert.throws(() => evaluateXPathToString(`${daysArray}?Monday`), 'XPTY0004');
		});

		it('is equivalent to .(KS), if the KeySpecifier is an IntegerLiteral and the context item is an array', () => {
			chai.assert.isTrue(evaluateXPathToBoolean(`${daysArray}?1 eq ${daysArray}(1)`));
		});

		it("is equivalent to 'for $k in fn:data(KS) return .($k)', if the KeySpecifier is a ParenthesizedExpr and the context item is an array", () => {
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					`let $ks := 2 to 4 return deep-equal(${daysArray}?($ks), for $k in fn:data($ks) return ${daysArray}($k))`
				)
			);
		});

		it('is equivalent to \'for $k in 1 to array:size(.) return .($k)\', if the KeySpecifier is a wildcard ("*") and the context item is an array', () => {
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					`deep-equal(${daysArray}?*, for $k in 1 to array:size(${daysArray}) return ${daysArray}($k))`
				)
			);
		});
	});

	describe('postfix lookup', () => {
		it('can lookup in a map', () => {
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					'map { "first" : "Jenna", "last" : "Scott" }?first eq "Jenna"'
				)
			);
		});

		it('can lookup in an array', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('[4, 5, 6]?2 eq 5'));
		});

		it('can lookup in multiple maps', () => {
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					'deep-equal((map {"first": "Tom"}, map {"first": "Dick"}, map {"first": "Harry"})?first, ("Tom", "Dick", "Harry"))'
				)
			);
		});

		it('can lookup in multiple arrays', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('deep-equal(([1,2,3], [4,5,6])?2, (2, 5))'));
		});

		it('gets all items using the * key specifier', () => {
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					'map { "first" : "Jenna", "*" : "Scott" }?* = ("Jenna", "Scott")'
				)
			);
		});

		it('treats handles a string keys specifier as string', () => {
			chai.assert.isTrue(
				evaluateXPathToBoolean('map { "first" : "Jenna", "*" : "Scott" }?("*") eq "Scott"')
			);
		});

		it('throws FOAY0001 error, if the context item does not have an result at that index', () => {
			chai.assert.throws(() => evaluateXPathToString(`["a","b"]?3`), 'FOAY0001');
		});
	});
});
