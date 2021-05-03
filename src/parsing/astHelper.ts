import { BaseType, stringToValueType, ValueType } from '../expressions/dataTypes/Value';
import { SourceRange } from '../expressions/debug/StackTraceGenerator';

type QName = { localName: string; namespaceURI: string | null; prefix: string };

export interface IAST extends Array<string | object | SourceRange | IAST> {
	0: string;
}

/**
 * Get the all children with the given name. Automatically skips attributes
 *
 * @param   ast   The parent
 * @param   name  The name of the children, without any prefixes
 *
 * @return  The matching children
 */
function getChildren(ast: IAST, name: string): IAST[] {
	const children = [];
	for (let i = 1; i < ast.length; ++i) {
		if (!Array.isArray(ast[i])) {
			continue;
		}
		if (name === '*' || ast[i][0] === name) {
			children.push(ast[i]);
		}
	}
	return children;
}

/**
 * Get the first child with the given name. Automatically skips attributes
 *
 * @param   ast   The parent
 * @param   name  The name of the child, without any prefixes. Array for "or"
 *
 * @return  The matching child, or null
 */
function getFirstChild(ast: IAST, name: string | string[]): IAST | null {
	if (name !== '*' && !Array.isArray(name)) {
		name = [name];
	}
	for (let i = 1; i < ast.length; ++i) {
		if (!Array.isArray(ast[i])) {
			continue;
		}
		if (name === '*' || name.includes(ast[i][0])) {
			return ast[i] as IAST;
		}
	}
	return null;
}

/**
 * Get the textContent of the given ast node (assuming its type is simpleContent)
 *
 * @param   ast  The parent
 * @return  The string content
 */
function getTextContent(ast: IAST): string {
	if (ast.length < 2) {
		return '';
	}
	if (typeof ast[1] === 'object') {
		return (ast[2] || '') as string;
	}
	return ast[1] || '';
}

/**
 * Get the type declaration described in the given ast node
 *
 * @param   ast  The parent
 * @return  The type declaration
 */
function getTypeDeclaration(ast: IAST): ValueType {
	const typeDeclarationAst = getFirstChild(ast, 'typeDeclaration');
	if (!typeDeclarationAst || getFirstChild(typeDeclarationAst, 'voidSequenceType')) {
		return { kind: BaseType.ANY, item: { kind: BaseType.ITEM } };
	}

	const determineType = (typeAst: IAST): ValueType => {
		switch (typeAst[0]) {
			case 'documentTest':
				return { kind: BaseType.DOCUMENTNODE };
			case 'elementTest':
				return { kind: BaseType.ELEMENT };
			case 'attributeTest':
				return { kind: BaseType.ATTRIBUTE };
			case 'piTest':
				return { kind: BaseType.PROCESSINGINSTRUCTION };
			case 'commentTest':
				return { kind: BaseType.COMMENT };
			case 'textTest':
				return { kind: BaseType.TEXT };
			case 'anyKindTest':
				return { kind: BaseType.NODE };
			case 'anyItemType':
				return { kind: BaseType.ITEM };
			case 'anyFunctionTest':
			case 'functionTest':
			case 'typedFunctionTest':
				return { kind: BaseType.FUNCTION, returnType: undefined, params: [] };
			case 'anyMapTest':
			case 'typedMapTest':
				return { kind: BaseType.MAP, items: [] };
			case 'anyArrayTest':
			case 'typedArrayTest':
				return { kind: BaseType.ARRAY, items: [] };
			case 'atomicType':
				return stringToValueType(
					[getAttribute(typeAst, 'prefix'), getTextContent(typeAst)].join(':')
				);
			case 'parenthesizedItemType':
				return determineType(getFirstChild(typeAst, '*'));
			case 'schemaElementTest':
			case 'schemaAttributeTest':
			case 'namespaceNodeTest':
			default:
				throw new Error(
					`Type declaration "${
						getFirstChild(typeDeclarationAst, '*')[0]
					}" is not supported.`
				);
		}
	};

	const type = determineType(getFirstChild(typeDeclarationAst, '*'));

	let occurrence = null;
	const occurrenceNode = getFirstChild(typeDeclarationAst, 'occurrenceIndicator');
	if (occurrenceNode) {
		occurrence = getTextContent(occurrenceNode);
	}

	switch (occurrence) {
		case '*':
			return { kind: BaseType.ANY, item: type };
		case '?':
			return { kind: BaseType.NULLABLE, item: type };
		case '+':
			return { kind: BaseType.SOME, item: type };
		case '':
		case null:
			return type;
	}
}

/**
 * Follow a path to an AST node
 */
function followPath(ast: IAST, path: string[]): IAST | null {
	return path.reduce(getFirstChild, ast);
}

/**
 * Get the value of the given attribute
 */
function getAttribute(ast: IAST, attributeName: string): string | null {
	if (!Array.isArray(ast)) {
		return null;
	}
	const attrs = ast[1];
	if (typeof attrs !== 'object' || Array.isArray(attrs)) {
		return null;
	}

	return attributeName in attrs ? attrs[attributeName] : null;
}

/**
 * Get the parts of a QName
 */
function getQName(ast: IAST): QName {
	return {
		localName: getTextContent(ast),
		namespaceURI: getAttribute(ast, 'URI'),
		prefix: getAttribute(ast, 'prefix') || '',
	};
}

export default {
	followPath,
	getAttribute,
	getChildren,
	getFirstChild,
	getQName,
	getTextContent,
	getTypeDeclaration,
};
