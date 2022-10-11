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
 *  A map to translate from general compare to value compare
 */
const OPERATOR_TRANSLATION: { [s: string]: string } = {
	['equalOp']: 'eqOp',
	['notEqualOp']: 'neOp',
	['lessThanOrEqualOp']: 'leOp',
	['lessThanOp']: 'ltOp',
	['greaterThanOrEqualOp']: 'geOp',
	['greaterThanOp']: 'gtOp',
};

export function getDataFromOperandCode(
	identifier: string,
	generatedType: GeneratedCodeBaseType,
	valueType: ValueType
): string {
	let code = identifier;
	// If the generated code returns an iterator, get the first value
	if (generatedType === GeneratedCodeBaseType.Generator) {
		code = `${code}.next().value`;
	}

	// If the type is an attribute, get the value. Though: if the attribute is absent, return null
	// instead.
	if (valueType === ValueType.ATTRIBUTE) {
		code = `(function () { const attr = ${code}; return attr ? domFacade.getData(attr) : null})()`;
	}

	return code;
}

/**
 * Generates javascript code for a value compare expression.
 *
 * @param ast The ast of the value compare expression
 * @param compareType The type of comparison we're executing
 * @param firstExpr The generated code of the first expression
 * @param secondExpr The generated code of the second expression
 * @param identifier The identifier of the result
 * @param staticContext The code generation context
 * @returns Generated code of the value compare
 */
export function emitValueCompare(
	ast: IAST,
	compareType: string,
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext
): PartialCompilationResult {
	const firstType = astHelper.getAttribute(
		astHelper.followPath(ast, ['firstOperand', '*']),
		'type'
	);
	const secondType = astHelper.getAttribute(
		astHelper.followPath(ast, ['secondOperand', '*']),
		'type'
	);
	// If we don't have the types of both operands, we cannot generate the correct code
	if (!firstType || !secondType) {
		return rejectAst('Can not generate code for compare without both types');
	}

	// Check if both operands are supported
	const supportedTypes = [ValueType.ATTRIBUTE, ValueType.XSSTRING];
	if (!supportedTypes.includes(firstType.type) || !supportedTypes.includes(secondType.type)) {
		return rejectAst(
			`Unsupported types in compare: [${valueTypeToString(
				firstType.type
			)}, ${valueTypeToString(secondType.type)}]`
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
				context
			);
			const secondAsValue = emitConversionToValue(secondExpr, contextItemExpr, context);
			const secondAtomized = emitAtomizedValue(secondAsValue, secondType, context);
			return mapPartialCompilationResult(
				context.getIdentifierFor(secondAtomized, 'second'),
				(secondAtomized) => {
					let nullChecks: string[] = [];
					if (doesTypeAllowEmpty(firstType)) {
						nullChecks.push(`${firstAtomized.code} === null`);
					}
					if (doesTypeAllowEmpty(secondType)) {
						nullChecks.push(`${secondAtomized.code} === null`);
					}
					// TODO: this was wrapped in function(contextItem) { ... }
					// (together with vars in function body!)
					// We'll probably need that for predicates...
					return acceptAst(
						`(${nullChecks.length ? `${nullChecks.join(' || ')} ? null : ` : ''}${
							firstAtomized.code
						} ${operator} ${secondAtomized.code})`,
						{ type: GeneratedCodeBaseType.Value },
						[...firstAtomized.variables, ...secondAtomized.variables]
					);
				}
			);
		}
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
export function emitGeneralCompare(
	ast: IAST,
	compareType: string,
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext
): PartialCompilationResult {
	const firstType: SequenceType = astHelper.getAttribute(
		astHelper.followPath(ast, ['firstOperand', '*']),
		'type'
	);
	const secondType: SequenceType = astHelper.getAttribute(
		astHelper.followPath(ast, ['secondOperand', '*']),
		'type'
	);
	if (!firstType || !secondType) {
		return rejectAst('types of compare are not known');
	}
	if (
		firstType.mult === SequenceMultiplicity.EXACTLY_ONE &&
		secondType.mult === SequenceMultiplicity.EXACTLY_ONE
	) {
		return emitValueCompare(ast, OPERATOR_TRANSLATION[compareType], contextItemExpr, context);
	} else {
		return rejectAst('General comparison for sequences is not implemented');
	}
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
	context: CodeGenContext
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
