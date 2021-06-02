import {
	SequenceMultiplicity,
	SequenceType,
	stringToValueType,
	ValueType,
} from '../expressions/dataTypes/Value';
import { SourceRange } from '../expressions/debug/StackTraceGenerator';

type QName = { localName: string; namespaceURI: string | null; prefix: string };

type ASTAttributes = { [attrName: string]: string | SequenceType };

export interface IAST extends Array<string | ASTAttributes | SourceRange | IAST> {
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
	const children: IAST[] = [];
	for (let i = 1; i < ast.length; ++i) {
		if (!Array.isArray(ast[i])) {
			continue;
		}
		const astPart = ast[i] as IAST;
		if (name === '*' || astPart[0] === name) {
			children.push(astPart);
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
		const astPart = ast[i] as IAST;
		if (name === '*' || name.includes(astPart[0])) {
			return astPart;
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
function getTypeDeclaration(ast: IAST): SequenceType {
	const typeDeclarationAst = getFirstChild(ast, 'typeDeclaration');
	if (!typeDeclarationAst || getFirstChild(typeDeclarationAst, 'voidSequenceType')) {
		return { type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE };
	}

	const determineType = (typeAst: IAST): ValueType => {
		switch (typeAst[0]) {
			case 'documentTest':
				return ValueType.DOCUMENTNODE;
			case 'elementTest':
				return ValueType.ELEMENT;
			case 'attributeTest':
				return ValueType.ATTRIBUTE;
			case 'piTest':
				return ValueType.PROCESSINGINSTRUCTION;
			case 'commentTest':
				return ValueType.COMMENT;
			case 'textTest':
				return ValueType.TEXT;
			case 'anyKindTest':
				return ValueType.NODE;
			case 'anyItemType':
				return ValueType.ITEM;
			case 'anyFunctionTest':
			case 'functionTest':
			case 'typedFunctionTest':
				return ValueType.FUNCTION;
			case 'anyMapTest':
			case 'typedMapTest':
				return ValueType.MAP;
			case 'anyArrayTest':
			case 'typedArrayTest':
				return ValueType.ARRAY;
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

	const type: SequenceType = {
		type: determineType(getFirstChild(typeDeclarationAst, '*')),
		mult: SequenceMultiplicity.EXACTLY_ONE,
	};

	let occurrence = null;
	const occurrenceNode = getFirstChild(typeDeclarationAst, 'occurrenceIndicator');
	if (occurrenceNode) {
		occurrence = getTextContent(occurrenceNode);
	}

	switch (occurrence) {
		case '*':
			type.mult = SequenceMultiplicity.ZERO_OR_MORE;
			return type;
		case '?':
			type.mult = SequenceMultiplicity.ZERO_OR_ONE;
			return type;
		case '+':
			type.mult = SequenceMultiplicity.ONE_OR_MORE;
			return type;
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
function getAttribute(ast: IAST, attributeName: string): string | SequenceType | null {
	if (!Array.isArray(ast)) {
		return null;
	}
	const maybeAttrs = ast[1];
	if (typeof maybeAttrs !== 'object' || Array.isArray(maybeAttrs)) {
		return null;
	}
	const attrs = maybeAttrs as ASTAttributes;

	return attributeName in attrs ? attrs[attributeName] : null;
}

/**
 * Get the parts of a QName
 */
function getQName(ast: IAST): QName {
	return {
		localName: getTextContent(ast),
		namespaceURI: getAttribute(ast, 'URI') as string,
		prefix: (getAttribute(ast, 'prefix') as string) || '',
	};
}

/**
 * Insert an attribute with a given name and value to the AST.
 *
 * @param ast The ast node to insert the attribute to
 * @param name The name of the attribute
 * @param data The data of the attribute
 */
function insertAttribute(ast: IAST, name: string, data: any) {
	if (typeof ast[1] === 'object' && !Array.isArray(ast[1])) {
		(ast[1] as ASTAttributes)[name] = data;
	} else {
		const obj: ASTAttributes = {};
		obj[name] = data;
		ast.splice(1, 0, obj);
	}
}

export default {
	followPath,
	getAttribute,
	getChildren,
	getFirstChild,
	getQName,
	getTextContent,
	getTypeDeclaration,
	insertAttribute,
};
