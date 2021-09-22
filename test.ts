const fs = require('fs');
const parseExpression = require('./src/parsing/parseExpression').default;
const astHelper = require('./src/parsing/astHelper').default;

let queries = fs.readFileSync('queries_unique.txt').toString().split('\n');
// queries = queries.sort((a: string, b: string) => a.length - b.length);
// let queries = ['count(12)'];
console.log(`Loaded ${queries.length} queries`);

const astNodes = [
	'module',
	'mainModule',
	'queryBody',
	'andOp',
	'orOp',
	'unaryPlusOp',
	'unaryMinusOp',
	'addOp',
	'subtractOp',
	'multiplyOp',
	'divOp',
	'idivOp',
	'modOp',
	'sequenceExpr',
	'unionOp',
	'exceptOp',
	'intersectOp',
	'stringConcatenateOp',
	'rangeSequenceExpr',
	'equalOp',
	'notEqualOp',
	'lessThanOrEqualOp',
	'lessThanOp',
	'greaterThanOrEqualOp',
	'greaterThanOp',
	'eqOp',
	'neOp',
	'ltOp',
	'leOp',
	'gtOp',
	'geOp',
	'isOp',
	'nodeBeforeOp',
	'nodeAfterOp',
	'pathExpr',
	'contextItemExpr',
	'functionCallExpr',
	'inlineFunctionExpr',
	'arrowExpr',
	'dynamicFunctionInvocationExpr',
	'namedFunctionRef',
	'integerConstantExpr',
	'stringConstantExpr',
	'decimalConstantExpr',
	'doubleConstantExpr',
	'varRef',
	'flworExpr',
	'quantifiedExpr',
	'ifThenElseExpr',
	'instanceOfExpr',
	'castExpr',
	'castableExpr',
	'simpleMapExpr',
	'mapConstructor',
	'arrayConstructor',
	'unaryLookup',
	'typeswitchExpr',
	'elementConstructor',
	'attributeConstructor',
	'computedAttributeConstructor',
	'computedCommentConstructor',
	'computedTextConstructor',
	'computedElementConstructor',
	'computedPIConstructor',
	'CDataSection',
	'deleteExpr',
	'insertExpr',
	'renameExpr',
	'replaceExpr',
	'transformExpr',
	'firstOperand',
	'secondOperand',
	'stepExpr',
	'arguments',
	'rootExpr',
	'value',
	'filterExpr',
	'predicates',
	'piTest',
	'moduleDecl',
	'commentTest',
	'attributeTest',
	'textTest',
	'elementTest',
	'nameTest',
	'Wildcard',
	'libraryModule',
	'versionDecl',
];

const functionsToImplement: string[] = ['count', 'name', 'true', 'false', 'contains', 'deep-equal', 'exists'];

function processQuery(ast: any, supportedAstNodes: string[]): boolean {
	const nodeName = ast[0];

	if (nodeName.startsWith('prolog')) {
		return false;
	}
	// console.log(nodeName)

	if (!astNodes.includes(nodeName)) {
		// console.log(nodeName);
		return true;
	}

	if (!supportedAstNodes.includes(nodeName)) {
		return false;
	}

	if (nodeName === 'functionCallExpr') {
		const functionName = astHelper.getTextContent(astHelper.getFirstChild(ast, 'functionName'));
		// console.log(functionName);
		if (!functionsToImplement.includes(functionName)) {
			return false;
		}
	}

	for (const child of astHelper.getChildren(ast, '*')) {
		// console.log(child);
		if (!processQuery(child, supportedAstNodes)) return false;
	}

	return true;
}

// for (const node of astNodes) {
	const supportedAstNodes = [
		'module',
		'mainModule',
		'queryBody',
		'pathExpr',
		'andOp',
		'orOp',
		'stringConstantExpr',
		'equalOp',
		'notEqualOp',
		'eqOp',
		'neOp',
		'functionCallExpr',
		'firstOperand',
		'secondOperand',
		'stepExpr',
		'arguments',
		'rootExpr',
		'value',
        'nameTest'
	];

	let succesful = 0;
	for (const query of queries) {
		try {
			const ast = parseExpression(query, {});
			if (processQuery(ast, supportedAstNodes)) {
				console.log(query);
				succesful++;
			}
		} catch (e) {}
	}

    console.log(succesful)
	// console.log(node + ": " + succesful);
// ?}
