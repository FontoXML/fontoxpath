import { NamespaceResolver } from '../types/Options';
import { emitBaseExpr } from './emitBaseExpr';
import { mapPartialCompilationResult } from './emitHelpers';
import {
	acceptAst,
	GeneratedCodeBaseType,
	PartialCompilationResult,
	PartiallyCompiledAstAccepted,
} from './JavaScriptCompiledXPath';

export class CodeGenContext {
	public resolveNamespace: NamespaceResolver;

	public defaultFunctionNamespaceUri: string;

	// Need to create indirection through context for emitBaseExpr to avoid a cyclic dependency
	// that the Closure compiler can't handle...
	public emitBaseExpr: typeof emitBaseExpr;

	private _identifierExprByExpr = new Map<
		PartiallyCompiledAstAccepted,
		PartiallyCompiledAstAccepted
	>();

	private _nextByPrefix = new Map<string, number>();

	public constructor(resolveNamespace: NamespaceResolver, defaultFunctionNamespaceUri: string) {
		this.resolveNamespace = resolveNamespace;
		this.defaultFunctionNamespaceUri = defaultFunctionNamespaceUri;
		this.emitBaseExpr = emitBaseExpr;
	}

	private _getNewIdentifier(prefix = 'v'): string {
		const next = this._nextByPrefix.get(prefix) ?? 0;
		this._nextByPrefix.set(prefix, next + 1);
		return `${prefix}${next}`;
	}

	public getIdentifierFor(
		expr: PartialCompilationResult,
		prefix = 'v'
	): PartialCompilationResult {
		return mapPartialCompilationResult(expr, (expr) => {
			let identifierExpr = this._identifierExprByExpr.get(expr);
			if (!identifierExpr) {
				const identifier = this._getNewIdentifier(prefix);
				identifierExpr = acceptAst(identifier, expr.generatedCodeType, [
					...expr.variables,
					`const ${identifier} = ${expr.code};`,
				]);
				this._identifierExprByExpr.set(expr, identifierExpr);
				this._identifierExprByExpr.set(identifierExpr, identifierExpr);
			}
			return identifierExpr;
		});
	}

	public getVarInScope(identifier: string): PartiallyCompiledAstAccepted {
		const expr = acceptAst(identifier, { type: GeneratedCodeBaseType.Value }, []);
		this._identifierExprByExpr.set(expr, expr);
		return expr;
	}

	public getNewIdentifier(prefix = 'v'): PartiallyCompiledAstAccepted {
		return this.getVarInScope(this._getNewIdentifier(prefix));
	}
}
