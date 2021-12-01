import { or, Parser, preceded, star, then, token } from 'prsc';
import { regex, wrapArray, unimplemented } from './prscParser';
import { IAST } from '../astHelper';

const ncNameStartChar: Parser<string> = or([
	regex(
		/[A-Z_a-z\xC0-\xD6\xD8-\xF6\xF8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/
	),
	then(regex(/[\uD800-\uDB7F]/), regex(/[\uDC00-\uDFFF]/), (a, b) => a + b),
]);

const ncNameChar: Parser<string> = or([
	ncNameStartChar,
	regex(/[\-\.0-9\xB7\u0300-\u036F\u203F\u2040]/),
]);

// XML-4/XQuery-235 - NCName
// https://www.w3.org/TR/REC-xml-names/#NT-NCName
export const ncName: Parser<string> = then(
	ncNameStartChar,
	star(ncNameChar),
	(a, b) => a + b.join('')
);

// XQuery-223 - URIQualifiedName
/// https://www.w3.org/TR/xquery-31/#doc-xquery31-URIQualifiedName
const uriQualifiedName: Parser<IAST> = unimplemented;

// XML-11 - LocalPart
const localPart: Parser<string> = ncName;

// XML-10 - Prefix
const xmlPrefix: Parser<string> = ncName;

// XML-9 - UnprefixedName
const unprefixedName: Parser<IAST> = wrapArray(localPart);

// XML-8 - PrefixedName
// TODO: give this better types
const prefixedName: Parser<any> = then(
	xmlPrefix,
	preceded(token(':'), localPart),
	(prefix, local) => [{ ['prefix']: prefix }, local]
);

// XML-7/XQuery-234 - QName
// https://www.w3.org/TR/xquery-31/#prod-xquery31-QName
// TODO: give this better types
export const qName: Parser<any> = or([prefixedName, unprefixedName]);

// XQuery-218 - EQName
// https://www.w3.org/TR/xquery-31/#doc-xquery31-EQName
export const eqName: Parser<IAST> = or([qName, uriQualifiedName]) as Parser<IAST>;

// XQuery-206 - TypeName
// https://www.w3.org/TR/xquery-31/#prod-xquery31-TypeName
export const typeName: Parser<IAST> = eqName;

// XQuery-205 - SimpleTypeName
export const simpleTypeName: Parser<IAST> = typeName;

// https://www.w3.org/TR/xquery-31/#id-reserved-fn-names
export const reservedFunctionNames = or([
	token('array'),
	token('attribute'),
	token('comment'),
	token('document-node'),
	token('element'),
	token('empty-sequence'),
	token('function'),
	token('if'),
	token('item'),
	token('map'),
	token('namespace-node'),
	token('node'),
	token('processing-instruction'),
	token('schema-attribute'),
	token('schema-element'),
	token('switch'),
	token('text'),
	token('typeswitch'),
]);
