import {
	Attr,
	CDATASection,
	CharacterData,
	Comment,
	compareSpecificity,
	CompiledXPathFunction,
	compileXPathToJavaScript,
	createTypedValueFactory,
	Document,
	domFacade,
	Element,
	evaluateUpdatingExpression,
	evaluateUpdatingExpressionSync,
	EvaluateXPath,
	evaluateXPath,
	executeJavaScriptCompiledXPath,
	executePendingUpdateList,
	ExternalTypedValueFactory,
	FunctionNameResolver,
	getBucketForSelector,
	getBucketsForNode,
	IAstAccepted,
	IAstRejected,
	IDocumentWriter,
	IDomFacade,
	INodesFactory,
	IReturnTypes,
	ISimpleNodesFactory,
	JavaScriptCompiledXPathResult,
	Language,
	LexicalQualifiedName,
	Logger,
	NamespaceResolver,
	Node,
	Options,
	parseScript,
	precompileXPath,
	ProcessingInstruction,
	Profiler,
	profiler,
	registerCustomXPathFunction,
	registerXQueryModule,
	ResolvedQualifiedName,
	ReturnType,
	Text,
	UpdatingOptions,
	ValidValue,
	ValidValueSequence,
	XPathPerformanceMeasurement,
} from '../src/index';

let totalCases = 0;
let codegenCases = 0;
let variablesCases = 0;

const evaluateXPathWithJsCodegen = <
	TNode extends Node,
	TReturnType extends keyof IReturnTypes<TNode>
>(
	query: string,
	contextItem?: any | null,
	localDomFacade?: IDomFacade | null,
	returnType?: ReturnType,
	options?: Options,
	variables?: { [s: string]: any } | null
): IReturnTypes<TNode>[TReturnType] => {
	totalCases++;

	if (variables !== undefined && variables !== null && Object.keys(variables).length !== 0) {
		// JSCodegen does not support user-defined variables (yet)
		variablesCases++;
		// console.log(
		// 	`Total cases: ${totalCases}, JSCodegen cases: ${codegenCases}, Variables cases: ${variablesCases}`
		// );
		return evaluateXPath(query, contextItem, localDomFacade, variables, returnType, options);
	}

	returnType = returnType || (ReturnType.ANY as any);
	const compiledXPathResult = compileXPathToJavaScript(query, returnType, options);
	if (compiledXPathResult.isAstAccepted === true) {
		// tslint:disable-next-line
		const evalFunction = new Function(compiledXPathResult.code) as CompiledXPathFunction;

		codegenCases++;
		return executeJavaScriptCompiledXPath(evalFunction, contextItem, localDomFacade);
	} else {
		// The query AST was not eligible to be converted to Javascript
		return evaluateXPath(query, contextItem, localDomFacade, null, returnType, options);
	}
};

export function evaluateXPathToArray(
	selector: string,
	contextItem?: any | null,
	localDomFacade?: IDomFacade | null,
	variables?: { [s: string]: any } | null,
	options?: Options | null
): any[] {
	return evaluateXPathWithJsCodegen(
		selector,
		contextItem,
		localDomFacade,
		ReturnType.ARRAY,
		options,
		variables
	);
}

export function evaluateXPathToAsyncIterator(
	selector: string,
	contextItem?: any | null,
	localDomFacade?: IDomFacade | null,
	variables?: { [s: string]: any } | null,
	options?: Options | null
): AsyncIterableIterator<any> {
	return evaluateXPathWithJsCodegen(
		selector,
		contextItem,
		localDomFacade,
		ReturnType.ASYNC_ITERATOR,
		options,
		variables
	);
}

export function evaluateXPathToBoolean(
	selector: string,
	contextItem?: any | null,
	localDomFacade?: IDomFacade | null,
	variables?: { [s: string]: any } | null,
	options?: Options | null
): boolean {
	return evaluateXPathWithJsCodegen(
		selector,
		contextItem,
		localDomFacade,
		ReturnType.BOOLEAN,
		options,
		variables
	);
}

export function evaluateXPathToFirstNode<T extends Node>(
	selector: string,
	contextItem?: any | null,
	localDomFacade?: IDomFacade | null,
	variables?: { [s: string]: any } | null,
	options?: Options | null
): T | null {
	return evaluateXPathWithJsCodegen(
		selector,
		contextItem,
		localDomFacade,
		ReturnType.FIRST_NODE,
		options,
		variables
	);
}

export function evaluateXPathToMap(
	selector: string,
	contextItem?: any | null,
	localDomFacade?: IDomFacade | null,
	variables?: { [s: string]: any } | null,
	options?: Options | null
): { [s: string]: any } {
	return evaluateXPathWithJsCodegen(
		selector,
		contextItem,
		localDomFacade,
		ReturnType.MAP,
		options,
		variables
	);
}

export function evaluateXPathToNodes<T extends Node>(
	selector: string,
	contextItem?: any | null,
	localDomFacade?: IDomFacade | null,
	variables?: { [s: string]: any } | null,
	options?: Options | null
): T[] {
	return evaluateXPathWithJsCodegen(
		selector,
		contextItem,
		localDomFacade,
		ReturnType.NODES,
		options,
		variables
	);
}

export function evaluateXPathToNumber(
	selector: string,
	contextItem?: any | null,
	localDomFacade?: IDomFacade | null,
	variables?: { [s: string]: any } | null,
	options?: Options | null
): number {
	return evaluateXPathWithJsCodegen(
		selector,
		contextItem,
		localDomFacade,
		ReturnType.NUMBER,
		options,
		variables
	);
}

export function evaluateXPathToNumbers(
	selector: string,
	contextItem?: any | null,
	localDomFacade?: IDomFacade | null,
	variables?: { [s: string]: any } | null,
	options?: Options | null
): number[] {
	return evaluateXPathWithJsCodegen(
		selector,
		contextItem,
		localDomFacade,
		ReturnType.NUMBERS,
		options,
		variables
	);
}

export function evaluateXPathToString(
	selector: string,
	contextItem?: any | null,
	localDomFacade?: IDomFacade | null,
	variables?: { [s: string]: any } | null,
	options?: Options | null
): string {
	return evaluateXPathWithJsCodegen(
		selector,
		contextItem,
		localDomFacade,
		ReturnType.STRING,
		options,
		variables
	);
}

export function evaluateXPathToStrings(
	selector: string,
	contextItem?: any | null,
	localDomFacade?: IDomFacade | null,
	variables?: { [s: string]: any } | null,
	options?: Options | null
): string[] {
	return evaluateXPathWithJsCodegen(
		selector,
		contextItem,
		localDomFacade,
		ReturnType.STRINGS,
		options,
		variables
	);
}

export {
	Attr,
	CDATASection,
	CharacterData,
	Comment,
	CompiledXPathFunction,
	Document,
	Element,
	EvaluateXPath,
	ExternalTypedValueFactory,
	FunctionNameResolver,
	IAstAccepted,
	IAstRejected,
	IDocumentWriter,
	IDomFacade,
	INodesFactory,
	IReturnTypes,
	ISimpleNodesFactory,
	JavaScriptCompiledXPathResult,
	Language,
	LexicalQualifiedName,
	Logger,
	NamespaceResolver,
	Node,
	Options,
	ProcessingInstruction,
	Profiler,
	ResolvedQualifiedName,
	ReturnType,
	Text,
	ValidValueSequence,
	UpdatingOptions,
	ValidValue,
	XPathPerformanceMeasurement,
	compareSpecificity,
	compileXPathToJavaScript,
	domFacade,
	evaluateUpdatingExpression,
	evaluateUpdatingExpressionSync,
	evaluateXPath,
	executeJavaScriptCompiledXPath,
	executePendingUpdateList,
	getBucketForSelector,
	getBucketsForNode,
	parseScript,
	precompileXPath,
	profiler,
	registerCustomXPathFunction,
	registerXQueryModule,
	createTypedValueFactory,
};
