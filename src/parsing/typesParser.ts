import { map, optional, Parser, then } from 'prsc';
import { ASTAttributes, IAST } from './astHelper';
import { QNameAST } from './literalParser';
import { eqName } from './nameParser';
import { QUESTION_MARK } from './tokens';

export const typeName: Parser<QNameAST> = eqName;

export const simpleTypeName: Parser<IAST | [ASTAttributes, string]> = typeName;

export const singleType: Parser<IAST> = then(
	simpleTypeName,
	optional(QUESTION_MARK),
	(type, opt) =>
		opt !== null
			? ['singleType', ['atomicType', ...type], ['optional']]
			: ['singleType', ['atomicType', ...type]],
);

export const atomicOrUnionType: Parser<IAST> = map(eqName, (x) => ['atomicType', ...x]);
