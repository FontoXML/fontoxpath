define([
	'fontoxml-selectors/selectors/Specificity',
	'fontoxml-selectors/selectors/functions/FunctionCall',
	'fontoxml-selectors/selectors/quantified/QuantifiedExpression'
], function (
	Specificity,
	FunctionCall,
	QuantifiedExpression
	) {
	'use strict';

	describe('QuantifiedExpression.equals()', function () {
		it('returns true if compared with itself', function () {
			var varRef1 = new QuantifiedExpression(
					'every',
					[
						[
							'x',
							new FunctionCall('true', [])
						]
					],
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true)
					}),
				varRef2 = varRef1;

			var result1 = varRef1.equals(varRef2),
				result2 = varRef2.equals(varRef1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('it returns true if compared with an equal other QuantifiedExpression', function () {
			var varRef1 = new QuantifiedExpression('every',
					[
						[
							'x',
							new FunctionCall('true', [])
						]
					],
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true)
					}),
				varRef2 = new QuantifiedExpression('every',
					[
						[
							'x',
							new FunctionCall('true', [])
						]
					],
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true)
					});

			var result1 = varRef1.equals(varRef2),
				result2 = varRef2.equals(varRef1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
		});

		it('it returns false if compared with an unequal other QuantifiedExpression', function () {
			var varRef1 = new QuantifiedExpression('every',
					[
						[
							'x',
							new FunctionCall('true', [])
						]
					],
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true)
					}),
				varRef2 = new QuantifiedExpression('some',
					[
						[
							'x',
							new FunctionCall('true', [])
						]
					],
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true)
					}),
				varRef3 = new QuantifiedExpression('every',
					[
						[
							'y',
							new FunctionCall('true', [])
						]
					],
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(true)
					}),
				varRef4 = new QuantifiedExpression('every',
					[
						[
							'x',
							new FunctionCall('true', [])
						]
					],
					{
						specificity: new Specificity({}),
						equals: sinon.stub().returns(false)
					});

			var result1 = varRef1.equals(varRef2),
				result2 = varRef2.equals(varRef1),
				result3 = varRef3.equals(varRef1),
				result4 = varRef4.equals(varRef1);

			chai.expect(result1).to.equal(false);
			chai.expect(result2).to.equal(false);
			chai.expect(result3).to.equal(false);
			chai.expect(result4).to.equal(false);
		});
	});
});
