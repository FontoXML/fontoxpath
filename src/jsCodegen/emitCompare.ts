import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
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

	if (!leftType || !rightType) {
		return rejectAst('Left or right type of compare are not found, annotation failed.');
	}

	const supportedTypes = [ValueType.XSSTRING, ValueType.NODE];
	if (!supportedTypes.includes(leftType.type) || !supportedTypes.includes(rightType.type)) {
		return rejectAst('Unsupported types in compare');
	}

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

	const leftGenerated = getCompiledValueCode(firstExpr.code, firstExpr.generatedCodeType);
	const rightGenerated = getCompiledValueCode(secondExpr.code, secondExpr.generatedCodeType);

	if (
		(leftGenerated[1].type === GeneratedCodeBaseType.Value ||
			leftGenerated[1].type === GeneratedCodeBaseType.Variable) &&
		(rightGenerated[1].type === GeneratedCodeBaseType.Value ||
			rightGenerated[1].type === GeneratedCodeBaseType.Variable)
	) {
		return acceptAst(
			`function ${identifier}(contextItem) {
				${firstExpr.variables.join('\n')}
			 	${secondExpr.variables.join('\n')}
	 	     	return ${leftGenerated[0]} ${operator} ${rightGenerated[0]};
			}`,
			{
				type: GeneratedCodeBaseType.Function,
				returnType: { type: GeneratedCodeBaseType.Value },
			}
		);
	}

	const code = `
	function ${identifier}(contextItem) {
		${firstExpr.variables.join('\n')}
		${secondExpr.variables.join('\n')}

		let atomizedLeft;
		if (${leftGenerated[0]}.next) {
			atomizedLeft = atomize({value: ${leftGenerated[0]}}, {domFacade}).getAllValues().map(x => x.value);
		} else {
			atomizedLeft = [${leftGenerated[0]}];
		}
		let atomizedRight;
		if (${rightGenerated[0]}.next) {
			atomizedRight = atomize({value: ${
				rightGenerated[0]
			}}, {domFacade}).getAllValues().map(x => x.value);
		} else {
			atomizedRight = [${rightGenerated[0]}];
		}

		if (atomizedLeft.length === 0 || atomizedRight.length === 0) return [];
		
		return atomizedLeft[0] ${operator} atomizedRight[0];
	}
	`;

	return acceptAst(code, {
		type: GeneratedCodeBaseType.Function,
		returnType: { type: GeneratedCodeBaseType.Value },
	});
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
