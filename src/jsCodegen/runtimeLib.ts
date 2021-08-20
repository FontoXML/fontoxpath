import isSubtypeOf from '../expressions/dataTypes/isSubtypeOf';
import getEffectiveBooleanValue from '../expressions/dataTypes/Sequences/getEffectiveBooleanValue';
import Value from '../expressions/dataTypes/Value';
import { DONE_TOKEN, IterationResult, ready } from '../expressions/util/iterators';
import {
	acceptAst,
	GeneratedCodeBaseType,
	GeneratedCodeType,
	getCompiledValueCode,
	PartialCompilationResult,
} from './JavaScriptCompiledXPath';

export function determinePredicateTruthValue(
	identifier: string,
	code: string,
	type: GeneratedCodeType,
	contextItem: string = 'contextItem'
): PartialCompilationResult {
	switch (type.type) {
		case GeneratedCodeBaseType.Value:
		case GeneratedCodeBaseType.Variable:
			return acceptAst(`!!${identifier}`, { type: GeneratedCodeBaseType.Value }, [code]);
		case GeneratedCodeBaseType.Function: {
			const result = determinePredicateTruthValue(
				`${identifier}(${contextItem})`,
				'',
				type.returnType,
				contextItem
			);
			if (!result.isAstAccepted) {
				return result;
			}
			return acceptAst(`!!${result.code}`, result.generatedCodeType, [code]);
		}
		case GeneratedCodeBaseType.Iterator: {
			return acceptAst(
				`(() => {
					const result = ${identifier}.next();
					return result.done ? false : !!result.value; 
				})()`,
				{ type: GeneratedCodeBaseType.Value }
			);
		}
		case GeneratedCodeBaseType.None:
			throw new Error('Trying to get value of generated code with type None');
		default:
			throw new Error(
				'Unreachable! Trying to get compiled value of unsupported GeneratedCodeType.'
			);
	}
}

// Make sure Closure Compiler does not change property names.
declare interface IRuntimeLib {
	DONE_TOKEN: typeof DONE_TOKEN;
	getEffectiveBooleanValue: typeof getEffectiveBooleanValue;
	isSubtypeOf: typeof isSubtypeOf;
	ready: typeof ready;
}

const runtimeLib: IRuntimeLib = {
	DONE_TOKEN,
	getEffectiveBooleanValue,
	isSubtypeOf,
	ready,
};

export default runtimeLib;
