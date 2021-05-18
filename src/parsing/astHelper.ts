import {
	SequenceMultiplicity,
	SequenceType,
	stringToValueType,
	ValueType,
} from '../expressions/dataTypes/Value';
import { SourceRange } from '../expressions/debug/StackTraceGenerator';
import { BinaryEvaluationFunction } from '../typeInference/binaryEvaluationFunction';

type QName = { localName: string; namespaceURI: string | null; prefix: string };

export interface IAST
	extends Array<string | object | SourceRange | IAST | SequenceType | BinaryEvaluationFunction> {
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
	return (ast[1] as string) || '';
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
function getAttribute(
	ast: IAST,
	attributeName: string
): string | SequenceType | BinaryEvaluationFunction | null {
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
		namespaceURI: getAttribute(ast, 'URI') as string,
		prefix: (getAttribute(ast, 'prefix') as string) || '',
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
