define([
	'../dataTypes/BooleanValue',
	'../dataTypes/Sequence'
], function (
	BooleanValue,
	Sequence
) {
	'use strict';

	function fnNot (dynamicContext, sequence) {
		return Sequence.singleton(sequence.getEffectiveBooleanValue() ? BooleanValue.FALSE : BooleanValue.TRUE);
	}

	function fnBoolean (dynamicContext, sequence) {
		return Sequence.singleton(sequence.getEffectiveBooleanValue() ? BooleanValue.TRUE : BooleanValue.FALSE);
	}

	function fnTrue () {
		return Sequence.singleton(BooleanValue.TRUE);
	}

	function fnFalse () {
		return Sequence.singleton(BooleanValue.FALSE);
	}

	return {
		declarations: [
			{
				name: 'boolean',
				argumentTypes: ['item()*'],
				returnType: 'xs:boolean',
				callFunction: fnBoolean
			},

			{
				name: 'true',
				argumentTypes: [],
				returnType: 'xs:boolean',
				callFunction: fnTrue
			},

			{
				name: 'not',
				argumentTypes: ['item()*'],
				returnType: 'xs:boolean',
				callFunction: fnNot
			},

			{
				name: 'false',
				argumentTypes: [],
				returnType: 'xs:boolean',
				callFunction: fnFalse
			}
		],
		functions: {
			boolean: fnBoolean,
			true: fnTrue,
			false: fnFalse,
			not: fnNot
		}
	};
});
