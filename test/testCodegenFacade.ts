import {
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
	domFacade?: IDomFacade | null,
	returnType?: ReturnType,
	options?: Options,
	variables?: { [s: string]: any } | null
): IReturnTypes<TNode>[TReturnType] => {
	// console.log(
	// 	`Total cases: ${totalCases}, JSCodegen cases: ${codegenCases}, Variables cases: ${variablesCases}`
	// );
	totalCases++;

	if (variables != {} && variables != null) {
		//Mark as failing
		variablesCases++;
		return evaluateXPath(query, contextItem, domFacade, variables, returnType, options);
	}

	returnType = returnType || (ReturnType.ANY as any);
	const compiledXPathResult = compileXPathToJavaScript(query, returnType, options);
	if (compiledXPathResult.isAstAccepted === true) {
		// tslint:disable-next-line
		const evalFunction = new Function(compiledXPathResult.code) as CompiledXPathFunction;

		codegenCases++;
		return executeJavaScriptCompiledXPath(evalFunction, contextItem, domFacade);
	} else {
		//Mark as failing in csv
		return evaluateXPath(query, contextItem, domFacade, null, returnType, options);
	}
};

export function evaluateXPathToArray(
	selector: string,
	contextItem?: any | null,
	domFacade?: IDomFacade | null,
	variables?: { [s: string]: any } | null,
	options?: Options | null
): any[] {
	return evaluateXPathWithJsCodegen(
		selector,
		contextItem,
		domFacade,
		ReturnType.ARRAY,
		options,
		variables
	);
}

export function evaluateXPathToAsyncIterator(
	selector: string,
	contextItem?: any | null,
	domFacade?: IDomFacade | null,
	variables?: { [s: string]: any } | null,
	options?: Options | null
): AsyncIterableIterator<any> {
	return evaluateXPathWithJsCodegen(
		selector,
		contextItem,
		domFacade,
		ReturnType.ASYNC_ITERATOR,
		options,
		variables
	);
}

export function evaluateXPathToBoolean(
	selector: string,
	contextItem?: any | null,
	domFacade?: IDomFacade | null,
	variables?: { [s: string]: any } | null,
	options?: Options | null
): boolean {
	return evaluateXPathWithJsCodegen(
		selector,
		contextItem,
		domFacade,
		ReturnType.BOOLEAN,
		options,
		variables
	);
}

export function evaluateXPathToFirstNode<T extends Node>(
	selector: string,
	contextItem?: any | null,
	domFacade?: IDomFacade | null,
	variables?: { [s: string]: any } | null,
	options?: Options | null
): T | null {
	return evaluateXPathWithJsCodegen(
		selector,
		contextItem,
		domFacade,
		ReturnType.FIRST_NODE,
		options,
		variables
	);
}

export function evaluateXPathToMap(
	selector: string,
	contextItem?: any | null,
	domFacade?: IDomFacade | null,
	variables?: { [s: string]: any } | null,
	options?: Options | null
): { [s: string]: any } {
	return evaluateXPathWithJsCodegen(
		selector,
		contextItem,
		domFacade,
		ReturnType.MAP,
		options,
		variables
	);
}

export function evaluateXPathToNodes<T extends Node>(
	selector: string,
	contextItem?: any | null,
	domFacade?: IDomFacade | null,
	variables?: { [s: string]: any } | null,
	options?: Options | null
): T[] {
	return evaluateXPathWithJsCodegen(
		selector,
		contextItem,
		domFacade,
		ReturnType.NODES,
		options,
		variables
	);
}

export function evaluateXPathToNumber(
	selector: string,
	contextItem?: any | null,
	domFacade?: IDomFacade | null,
	variables?: { [s: string]: any } | null,
	options?: Options | null
): number {
	return evaluateXPathWithJsCodegen(
		selector,
		contextItem,
		domFacade,
		ReturnType.NUMBER,
		options,
		variables
	);
}

export function evaluateXPathToNumbers(
	selector: string,
	contextItem?: any | null,
	domFacade?: IDomFacade | null,
	variables?: { [s: string]: any } | null,
	options?: Options | null
): number[] {
	return evaluateXPathWithJsCodegen(
		selector,
		contextItem,
		domFacade,
		ReturnType.NUMBERS,
		options,
		variables
	);
}

export function evaluateXPathToString(
	selector: string,
	contextItem?: any | null,
	domFacade?: IDomFacade | null,
	variables?: { [s: string]: any } | null,
	options?: Options | null
): string {
	return evaluateXPathWithJsCodegen(
		selector,
		contextItem,
		domFacade,
		ReturnType.STRING,
		options,
		variables
	);
}

export function evaluateXPathToStrings(
	selector: string,
	contextItem?: any | null,
	domFacade?: IDomFacade | null,
	variables?: { [s: string]: any } | null,
	options?: Options | null
): string[] {
	return evaluateXPathWithJsCodegen(
		selector,
		contextItem,
		domFacade,
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
