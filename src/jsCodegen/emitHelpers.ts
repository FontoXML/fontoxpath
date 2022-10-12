import isSubtypeOf from '../expressions/dataTypes/isSubtypeOf';
import { doesTypeAllowEmpty } from '../expressions/dataTypes/typeHelpers';
import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import { Bucket } from '../expressions/util/Bucket';
import { CodeGenContext } from './CodeGenContext';
import {
	acceptAst,
	GeneratedCodeBaseType,
	PartialCompilationResult,
	PartiallyCompiledAstAccepted,
	rejectAst,
} from './JavaScriptCompiledXPath';

export function mapPartialCompilationResult(
	expr: PartialCompilationResult,
	cb: (expr: PartiallyCompiledAstAccepted) => PartialCompilationResult
): PartialCompilationResult {
	if (!expr.isAstAccepted) {
		return expr;
	}

	return cb(expr);
}

export function mapPartialCompilationResultAndBucket(
	expr: PartialCompilationResult,
	cb: (expr: PartiallyCompiledAstAccepted) => [PartialCompilationResult, Bucket]
): [PartialCompilationResult, Bucket] {
	if (!expr.isAstAccepted) {
		return [expr, null];
	}

	return cb(expr);
}

export function emitConversionToValue(
	expr: PartialCompilationResult,
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext
): PartialCompilationResult {
	return mapPartialCompilationResult(expr, (expr) => {
		switch (expr.generatedCodeType.type) {
			case GeneratedCodeBaseType.Value:
				return expr;

			case GeneratedCodeBaseType.Generator: {
				// Ensure we have an identifier for the generator in case this is used multiple times
				return mapPartialCompilationResult(
					context.getIdentifierFor(expr, 'nodes'),
					(expr) =>
						mapPartialCompilationResult(
							context.getIdentifierFor(contextItemExpr, 'contextItem'),
							(contextItemExpr) =>
								acceptAst(
									`(function () {
							const { done, value } = ${expr.code}(${contextItemExpr.code}).next();
							return done ? null : value;
						})()`,
									{ type: GeneratedCodeBaseType.Value },
									[...expr.variables, ...contextItemExpr.variables]
								)
						)
				);
			}

			default:
				throw new Error(
					`invalid generated code type to convert to value: ${expr.generatedCodeType.type}`
				);
		}
	});
}

export function emitEffectiveBooleanValue(
	expr: PartialCompilationResult,
	astType: SequenceType | null,
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext
): PartialCompilationResult {
	// TODO: a sequence of more than one non-node should return an error, but we don't generate such
	// sequences yet
	const value = emitConversionToValue(expr, contextItemExpr, context);
	if (
		astType &&
		astType.type === ValueType.XSBOOLEAN &&
		astType.mult === SequenceMultiplicity.EXACTLY_ONE
	) {
		// No need to coerce if this is already a boolean
		return value;
	}
	return mapPartialCompilationResult(value, (expr) => {
		return acceptAst(`!!${expr.code}`, { type: GeneratedCodeBaseType.Value }, expr.variables);
	});
}

export function emitAtomizedValue(
	expr: PartialCompilationResult,
	astType: SequenceType | null,
	context: CodeGenContext
): PartialCompilationResult {
	if (!astType) {
		return rejectAst('Can not atomize value if type was not annotated');
	}
	if (expr.isAstAccepted && expr.generatedCodeType.type !== GeneratedCodeBaseType.Value) {
		return rejectAst('Atomization only implemented for single value');
	}

	if (isSubtypeOf(astType.type, ValueType.XSSTRING)) {
		return expr;
	}

	if (isSubtypeOf(astType.type, ValueType.ATTRIBUTE)) {
		return mapPartialCompilationResult(context.getIdentifierFor(expr, 'attr'), (expr) =>
			acceptAst(
				`(${expr.code} ? domFacade.getData(${expr.code}) : null)`,
				{ type: GeneratedCodeBaseType.Value },
				expr.variables
			)
		);
	}
	return rejectAst('Atomization only implemented for string and attribute');
}

export function emitConversionToString(
	expr: PartialCompilationResult,
	astType: SequenceType,
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext
): PartialCompilationResult {
	const value = emitConversionToValue(expr, contextItemExpr, context);
	const atomized = emitAtomizedValue(value, astType, context);
	if (!doesTypeAllowEmpty(astType)) {
		return atomized;
	}
	return mapPartialCompilationResult(atomized, (atomized) =>
		acceptAst(
			`${atomized.code} ?? ''`,
			{ type: GeneratedCodeBaseType.Value },
			atomized.variables
		)
	);
}

function emitNodeCheck(
	expr: PartialCompilationResult,
	astType: SequenceType | null,
	context: CodeGenContext
): PartialCompilationResult {
	return mapPartialCompilationResult(context.getIdentifierFor(expr, 'node'), (expr) => {
		// Accept generators as-is (these currently always yield nodes)
		if (expr.generatedCodeType.type === GeneratedCodeBaseType.Generator) {
			return expr;
		}

		if (astType && !isSubtypeOf(astType.type, ValueType.NODE)) {
			return rejectAst('Can not evaluate to node if expression does not result in nodes');
		}

		// Emit a type check
		return acceptAst(
			`(function () {
				if (${expr.code} !== null && !${expr.code}.nodeType) {
					throw new Error('XPDY0050: The result of the expression was not a node');
				}
				return ${expr.code};
			})()`,
			{ type: GeneratedCodeBaseType.Value },
			expr.variables
		);
	});
}

export function emitConversionToFirstNode(
	expr: PartialCompilationResult,
	astType: SequenceType | null,
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext
): PartialCompilationResult {
	const exprAsValue = emitConversionToValue(expr, contextItemExpr, context);
	return emitNodeCheck(exprAsValue, astType, context);
}

export function emitConversionToNodes(
	expr: PartialCompilationResult,
	astType: SequenceType,
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext
): PartialCompilationResult {
	return mapPartialCompilationResult(expr, (expr) => {
		switch (expr.generatedCodeType.type) {
			case GeneratedCodeBaseType.Generator:
				return mapPartialCompilationResult(
					context.getIdentifierFor(expr, 'nodes'),
					(expr) =>
						mapPartialCompilationResult(
							context.getIdentifierFor(contextItemExpr, 'contextItem'),
							(contextItemExpr) =>
								acceptAst(
									`Array.from(${expr.code}(${contextItemExpr.code}))`,
									{ type: GeneratedCodeBaseType.Value },
									[...expr.variables, ...contextItemExpr.variables]
								)
						)
				);
			case GeneratedCodeBaseType.Value:
				return mapPartialCompilationResult(emitNodeCheck(expr, astType, context), (expr) =>
					acceptAst(
						`[${expr.code}]`,
						{ type: GeneratedCodeBaseType.Value },
						expr.variables
					)
				);
			default:
				return rejectAst('Unsupported code type to evaluate to nodes');
		}
	});
}

export function emitAnd(
	condition1: PartialCompilationResult,
	condition2: PartialCompilationResult
): PartialCompilationResult {
	return mapPartialCompilationResult(condition1, (condition1) =>
		mapPartialCompilationResult(condition2, (condition2) => {
			if (
				condition1.generatedCodeType.type !== GeneratedCodeBaseType.Value ||
				condition2.generatedCodeType.type !== GeneratedCodeBaseType.Value
			) {
				throw new Error('can only use emitAnd with value expressions');
			}
			return acceptAst(
				`${condition1.code} && ${condition2.code}`,
				{ type: GeneratedCodeBaseType.Value },
				[...condition1.variables, ...condition2.variables]
			);
		})
	);
}
