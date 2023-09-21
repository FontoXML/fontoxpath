import { doesTypeAllowEmpty } from '../expressions/dataTypes/typeHelpers';
import {
	SequenceMultiplicity,
	SequenceType,
	ValueType,
	valueTypeToString,
} from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';
import { CodeGenContext } from './CodeGenContext';
import {
	emitAtomizedValue,
	emitConversionToValue,
	mapPartialCompilationResult,
} from './emitHelpers';
import { emitOperand } from './emitOperand';
import {
	acceptAst,
	GeneratedCodeBaseType,
	PartialCompilationResult,
	rejectAst,
} from './JavaScriptCompiledXPath';

/**
 * A map to translate from general compare to value compare
 */
const OPERATOR_TRANSLATION: { [s: string]: string } = {
	['equalOp']: 'eqOp',
	['notEqualOp']: 'neOp',
	['lessThanOrEqualOp']: 'leOp',
	['lessThanOp']: 'ltOp',
	['greaterThanOrEqualOp']: 'geOp',
	['greaterThanOp']: 'gtOp',
};

const OPERATOR_SWAP_TABLE: { [s: string]: string } = {
	['eqOp']: 'eqOp',
	['neOp']: 'neOp',
	['leOp']: 'geOp',
	['ltOp']: 'gtOp',
	['geOp']: 'leOp',
	['gtOp']: 'ltOp',
};

/**
 * Generates javascript code for a value compare expression.
 */
function emitValueCompare(
	ast: IAST,
	compareType: string,
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext,
): PartialCompilationResult {
	const firstType = astHelper.getAttribute(
		astHelper.followPath(ast, ['firstOperand', '*']),
		'type',
	);
	const secondType = astHelper.getAttribute(
		astHelper.followPath(ast, ['secondOperand', '*']),
		'type',
	);
	// If we don't have the types of both operands, we cannot generate the correct code
	if (!firstType || !secondType) {
		return rejectAst('Can not generate code for value compare without both types');
	}

	// Check if both operands are supported
	const supportedTypes = [ValueType.ATTRIBUTE, ValueType.XSSTRING];
	if (!supportedTypes.includes(firstType.type) || !supportedTypes.includes(secondType.type)) {
		return rejectAst(
			`Unsupported types in compare: [${valueTypeToString(
				firstType.type,
			)}, ${valueTypeToString(secondType.type)}]`,
		);
	}

	// Make sure we support the comparison type
	const compareOperators = new Map<string, string>([
		['eqOp', '==='],
		['neOp', '!=='],
	]);
	if (!compareOperators.has(compareType)) {
		return rejectAst(compareType + ' not yet implemented');
	}
	// Get the correct operator
	const operator = compareOperators.get(compareType);

	// Evaluate both sides to values and atomize the result
	// TODO: error if more than one item in each sequence
	const [firstExpr, _firstBucket] = emitOperand(ast, 'firstOperand', contextItemExpr, context);
	const firstAsValue = emitConversionToValue(firstExpr, contextItemExpr, context);
	const firstAtomized = emitAtomizedValue(firstAsValue, firstType, context);
	return mapPartialCompilationResult(
		context.getIdentifierFor(firstAtomized, 'first'),
		(firstAtomized) => {
			const [secondExpr, _secondBucket] = emitOperand(
				ast,
				'secondOperand',
				contextItemExpr,
				context,
			);
			const secondAsValue = emitConversionToValue(secondExpr, contextItemExpr, context);
			const secondAtomized = emitAtomizedValue(secondAsValue, secondType, context);
			return mapPartialCompilationResult(
				context.getIdentifierFor(secondAtomized, 'second'),
				(secondAtomized) => {
					const nullChecks: string[] = [];
					if (doesTypeAllowEmpty(firstType)) {
						nullChecks.push(`${firstAtomized.code} === null`);
					}
					if (doesTypeAllowEmpty(secondType)) {
						nullChecks.push(`${secondAtomized.code} === null`);
					}
					return acceptAst(
						`(${nullChecks.length ? `${nullChecks.join(' || ')} ? null : ` : ''}${
							firstAtomized.code
						} ${operator} ${secondAtomized.code})`,
						{ type: GeneratedCodeBaseType.Value },
						[...firstAtomized.variables, ...secondAtomized.variables],
					);
				},
			);
		},
	);
}

function emitSimplifiedGeneralCompare(
	ast: IAST,
	singleItemOperandName: 'firstOperand' | 'secondOperand',
	multipleItemOperandName: 'firstOperand' | 'secondOperand',
	compareType: string,
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext,
): PartialCompilationResult {
	const singleType = astHelper.getAttribute(
		astHelper.followPath(ast, [singleItemOperandName, '*']),
		'type',
	);
	const multipleType = astHelper.getAttribute(
		astHelper.followPath(ast, [multipleItemOperandName, '*']),
		'type',
	);
	// If we don't have the types of both operands, we cannot generate the correct code
	if (!singleType || !multipleType) {
		return rejectAst('Can not generate code for general compare without both types');
	}

	// Check if both operands are supported
	const supportedTypes = [ValueType.ATTRIBUTE, ValueType.XSSTRING];
	if (!supportedTypes.includes(singleType.type) || !supportedTypes.includes(multipleType.type)) {
		return rejectAst(
			`Unsupported types in compare: [${valueTypeToString(
				singleType.type,
			)}, ${valueTypeToString(multipleType.type)}]`,
		);
	}

	// Make sure we support the comparison type
	const compareOperators = new Map<string, string>([
		['eqOp', '==='],
		['neOp', '!=='],
	]);
	if (!compareOperators.has(compareType)) {
		return rejectAst(compareType + ' not yet implemented');
	}
	// Get the correct operator
	const operator = compareOperators.get(compareType);

	// Evaluate our single-value side
	// TODO: error if more than one item in the sequence
	const [singleExpr, _singleBucket] = emitOperand(
		ast,
		singleItemOperandName,
		contextItemExpr,
		context,
	);
	const singleAsValue = emitConversionToValue(singleExpr, contextItemExpr, context);
	const singleAtomized = emitAtomizedValue(singleAsValue, singleType, context);
	return mapPartialCompilationResult(
		context.getIdentifierFor(singleAtomized, 'single'),
		(singleAtomized) => {
			const [multipleExpr, _multipleBucket] = emitOperand(
				ast,
				multipleItemOperandName,
				contextItemExpr,
				context,
			);
			return mapPartialCompilationResult(
				context.getIdentifierFor(multipleExpr, 'multiple'),
				(multipleExpr) => {
					if (multipleExpr.generatedCodeType.type !== GeneratedCodeBaseType.Generator) {
						return rejectAst(
							'can only generate general compare for a single value and a generator',
						);
					}
					const loopVar = context.getNewIdentifier('n');
					const atomizedLoopVar = emitAtomizedValue(loopVar, multipleType, context);
					return mapPartialCompilationResult(contextItemExpr, (contextItemExpr) =>
						mapPartialCompilationResult(atomizedLoopVar, (atomizedLoopVar) =>
							acceptAst(
								`(function () {
									for (const ${loopVar.code} of ${multipleExpr.code}(${contextItemExpr.code})) {
										${atomizedLoopVar.variables.join('\n')}
										if (${atomizedLoopVar.code} ${operator} ${singleAtomized.code}) {
											return true;
										}
									}
									return false;
								})()`,
								{ type: GeneratedCodeBaseType.Value },
								[
									...singleAtomized.variables,
									...loopVar.variables,
									...contextItemExpr.variables,
									...multipleExpr.variables,
								],
							),
						),
					);
				},
			);
		},
	);
}

/**
 * Generates javascript code for a general compare expression.
 *
 * @param ast The ast of the general compare expression
 * @param compareType The type of comparison we're executing
 * @param firstExpr The generated code of the first expression
 * @param secondExpr The generated code of the second expression
 * @param identifier The identifier of the result
 * @param staticContext The code generation context
 * @returns Generated code of the general compare
 */
function emitGeneralCompare(
	ast: IAST,
	compareType: string,
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext,
): PartialCompilationResult {
	const firstType: SequenceType = astHelper.getAttribute(
		astHelper.followPath(ast, ['firstOperand', '*']),
		'type',
	);
	const secondType: SequenceType = astHelper.getAttribute(
		astHelper.followPath(ast, ['secondOperand', '*']),
		'type',
	);
	if (!firstType || !secondType) {
		return rejectAst('types of compare are not known');
	}
	if (
		firstType.mult === SequenceMultiplicity.EXACTLY_ONE &&
		secondType.mult === SequenceMultiplicity.EXACTLY_ONE
	) {
		return emitValueCompare(ast, OPERATOR_TRANSLATION[compareType], contextItemExpr, context);
	}
	if (firstType.mult === SequenceMultiplicity.EXACTLY_ONE) {
		return emitSimplifiedGeneralCompare(
			ast,
			'firstOperand',
			'secondOperand',
			OPERATOR_TRANSLATION[compareType],
			contextItemExpr,
			context,
		);
	}
	if (secondType.mult === SequenceMultiplicity.EXACTLY_ONE) {
		return emitSimplifiedGeneralCompare(
			ast,
			'secondOperand',
			'firstOperand',
			OPERATOR_SWAP_TABLE[OPERATOR_TRANSLATION[compareType]],
			contextItemExpr,
			context,
		);
	}

	return rejectAst('General comparison for sequences is not implemented');
}

/**
 * Compiles compare expressions to a JavaScript function.
 *
 *
 * @param ast Logical expression AST node.
 * @param identifier Function identifier for the emitted function
 * @param staticContext Static context parameter to retrieve context-dependent information.
 * @param compareType The exact operator that will be compiled
 * @returns Wrapped compare expression.
 */
export function emitCompareExpr(
	ast: IAST,
	compareType: string,
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext,
): PartialCompilationResult {
	switch (compareType) {
		// valueCompare
		case 'eqOp':
		case 'neOp':
		case 'ltOp':
		case 'leOp':
		case 'gtOp':
		case 'geOp':
		case 'isOp':
			return emitValueCompare(ast, compareType, contextItemExpr, context);
		// generalCompare
		case 'equalOp':
		case 'notEqualOp':
		case 'lessThanOrEqualOp':
		case 'lessThanOp':
		case 'greaterThanOrEqualOp':
		case 'greaterThanOp':
			return emitGeneralCompare(ast, compareType, contextItemExpr, context);
		// nodeCompare
		case 'nodeBeforeOp':
		case 'nodeAfterOp':
		default:
			return rejectAst(`Unsupported compare type: ${compareType}`);
	}
}
