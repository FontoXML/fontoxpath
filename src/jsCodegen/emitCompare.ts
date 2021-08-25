import {
	SequenceMultiplicity,
	SequenceType,
	ValueType,
	valueTypeToString,
} from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';
import { CodeGenContext } from './CodeGenContext';
import { emitOperand } from './emitOperand';
// import { emitBaseExpr } from './emitBaseExpression';
import {
	acceptAst,
	FunctionIdentifier,
	GeneratedCodeBaseType,
	getCompiledValueCode,
	PartialCompilationResult,
	rejectAst,
} from './JavaScriptCompiledXPath';

function getDataFromOperandCode(
	identifier: string,
	generatedType: GeneratedCodeBaseType,
	valueType: ValueType
): string {
	let code = identifier;
	// If the generated code returns an iterator, get the first value
	if (generatedType === GeneratedCodeBaseType.Iterator) {
		code = `${code}.next().value`;
	}

	// If the type is an attribute, get the value
	if (valueType === ValueType.ATTRIBUTE) {
		code = `domFacade.getData(${code})`;
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
	firstExpr: PartialCompilationResult,
	secondExpr: PartialCompilationResult,
	identifier: string,
	_staticContext: CodeGenContext
): PartialCompilationResult {
	const leftType = astHelper.getAttribute(
		astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST,
		'type'
	);
	const rightType = astHelper.getAttribute(
		astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST,
		'type'
	);

	// If we don't have the types of both operands, we cannot generate the correct code
	if (!leftType || !rightType) {
		return rejectAst('Left or right type of compare are not found, annotation failed.');
	}

	// Check if both operands are supported
	const supportedTypes = [ValueType.ATTRIBUTE, ValueType.XSSTRING];
	if (!supportedTypes.includes(leftType.type) || !supportedTypes.includes(rightType.type)) {
		return rejectAst(
			`Unsupported types in compare: [${valueTypeToString(
				leftType.type
			)}, ${valueTypeToString(rightType.type)}]`
		);
	}

	// If one of the expressions didn't get accepted, return
	if (!firstExpr.isAstAccepted) {
		return firstExpr;
	}
	if (!secondExpr.isAstAccepted) {
		return secondExpr;
	}

	// Make sure both child expression got annotated
	if (!leftType || !rightType) {
		return rejectAst("Operands in compare weren't annotated");
	}

	const compareOperators: Record<string, string> = {
		eqOp: '===',
		neOp: '!==',
	};

	// Make sure we support the comparison type
	if (!compareOperators[compareType]) {
		return rejectAst(compareType + ' not yet implemented');
	}

	// Get the correct operator
	const operator = compareOperators[compareType];

	// Generate the code to get the value from both operands
	const leftGenerated = getCompiledValueCode(firstExpr.code, firstExpr.generatedCodeType);
	const rightGenerated = getCompiledValueCode(secondExpr.code, secondExpr.generatedCodeType);

	const leftCode = getDataFromOperandCode(leftGenerated[0], leftGenerated[1].type, leftType.type);
	const rightCode = getDataFromOperandCode(
		rightGenerated[0],
		rightGenerated[1].type,
		rightType.type
	);

	return acceptAst(
		`function ${identifier}(contextItem) {
				${firstExpr.variables.join('\n')}
			 	${secondExpr.variables.join('\n')}
	 	     	return ${leftCode} ${operator} ${rightCode};
		}`,
		{
			type: GeneratedCodeBaseType.Function,
			returnType: { type: GeneratedCodeBaseType.Value },
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
	firstExpr: PartialCompilationResult,
	secondExpr: PartialCompilationResult,
	identifier: string,
	staticContext: CodeGenContext
): PartialCompilationResult {
	const firstAstOp = astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST;
	const firstType: SequenceType = astHelper.getAttribute(ast, 'type');
	const secondAstOp = astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST;
	const secondType: SequenceType = astHelper.getAttribute(ast, 'type');
	if (!firstType || !secondType) {
		return rejectAst('types of compare are not known');
	}
	if (
		firstType.mult === SequenceMultiplicity.EXACTLY_ONE &&
		secondType.mult === SequenceMultiplicity.EXACTLY_ONE
	) {
		return emitValueCompare(
			ast,
			OPERATOR_TRANSLATION[compareType],
			firstExpr,
			secondExpr,
			identifier,
			staticContext
		);
	} else {
		return rejectAst('generalCompare with sequences is still in development');
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
	identifier: FunctionIdentifier,
	staticContext: CodeGenContext,
	compareType: string
): PartialCompilationResult {
	const firstExpr = emitOperand(ast, identifier, 'firstOperand', staticContext);
	if (!firstExpr.isAstAccepted) {
		return firstExpr;
	}

	const secondExpr = emitOperand(ast, identifier, 'secondOperand', staticContext);
	if (!secondExpr.isAstAccepted) {
		return secondExpr;
	}

	switch (compareType) {
		// valueCompare
		case 'eqOp':
		case 'neOp':
		case 'ltOp':
		case 'leOp':
		case 'gtOp':
		case 'geOp':
		case 'isOp':
			return emitValueCompare(
				ast,
				compareType,
				firstExpr,
				secondExpr,
				identifier,
				staticContext
			);
		// generalCompare
		case 'equalOp':
		case 'notEqualOp':
		case 'lessThanOrEqualOp':
		case 'lessThanOp':
		case 'greaterThanOrEqualOp':
		case 'greaterThanOp':
			return emitGeneralCompare(
				ast,
				compareType,
				firstExpr,
				secondExpr,
				identifier,
				staticContext
			);
		// nodeCompare
		case 'nodeBeforeOp':
		case 'nodeAfterOp':
		default:
			return rejectAst('Unsupported compare type');
	}
}

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
