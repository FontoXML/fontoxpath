import { followed, map, or, Parser, preceded, star, then } from 'prsc';
import { IAST } from './astHelper';
import { QNameAST } from './literalParser';
import { precededMultiple, regex } from './parsingFunctions';
import * as tokens from './tokens';
import { whitespace } from './whitespaceParser';

const ncNameStartChar: Parser<string> = or([
	regex(
		/[A-Z_a-z\xC0-\xD6\xD8-\xF6\xF8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/,
	),
	then(regex(/[\uD800-\uDB7F]/), regex(/[\uDC00-\uDFFF]/), (a, b) => a + b),
]);

const ncNameChar: Parser<string> = or([
	ncNameStartChar,
	regex(/[\-\.0-9\xB7\u0300-\u036F\u203F\u2040]/),
]);

export const ncName: Parser<string> = then(
	ncNameStartChar,
	star(ncNameChar),
	(a, b) => a + b.join(''),
);

export const prefix: Parser<IAST> = map(ncName, (x) => ['prefix', x]);

const nameStartChar: Parser<string> = or([ncNameStartChar, tokens.COLON]);

const nameChar: Parser<string> = or([ncNameChar, tokens.COLON]);

export const name: Parser<string> = then(
	nameStartChar,
	star(nameChar),
	(start, rest) => start + rest.join(''),
);

const localPart: Parser<string> = ncName;

const unprefixedName: Parser<QNameAST> = map(localPart, (x) => [
	{ ['prefix']: '', ['URI']: null },
	x,
]);

const xmlPrefix: Parser<string> = ncName;

const prefixedName: Parser<QNameAST> = then(
	xmlPrefix,
	preceded(tokens.COLON, localPart),
	(prefixPart, local) => [{ ['prefix']: prefixPart, ['URI']: null }, local],
);

export const qName: Parser<QNameAST> = or([prefixedName, unprefixedName]);

export const bracedURILiteral: Parser<string> = followed(
	precededMultiple(
		[tokens.Q_UPPER, whitespace, tokens.CURLY_BRACE_OPEN],
		map(star(regex(/[^{}]/)), (x) => x.join('').replace(/\s+/g, ' ').trim()),
	),
	tokens.CURLY_BRACE_CLOSE,
);

const uriQualifiedName: Parser<[string, string]> = then(
	bracedURILiteral,
	ncName,
	(uri, localName) => [uri, localName],
);

export const eqName: Parser<QNameAST> = or([
	map(uriQualifiedName, (x) => [{ ['prefix']: null, ['URI']: x[0] }, x[1]]),
	qName,
]);

export const elementName = eqName;

export const elementNameOrWildCard: Parser<IAST> = or([
	map(elementName, (qname) => ['QName', ...qname] as IAST),
	map(tokens.ASTERIX, (_) => ['star']),
]);

export const varName: Parser<QNameAST> = eqName;

export const varRef: Parser<IAST> = map(preceded(tokens.DOLLAR, varName), (x) => [
	'varRef',
	['name', ...x],
]);
