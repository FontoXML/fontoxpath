import type IDocumentWriter from './documentWriter/IDocumentWriter';
import ExternalDomFacade from './domFacade/ExternalDomFacade';
import type IDomFacade from './domFacade/IDomFacade';
import evaluateUpdatingExpression, { type UpdatingOptions } from './evaluateUpdatingExpression';
import evaluateUpdatingExpressionSync from './evaluateUpdatingExpressionSync';
import evaluateXPath, { type EvaluableExpression, type EvaluateXPath } from './evaluateXPath';
import evaluateXPathToArray from './evaluateXPathToArray';
import evaluateXPathToAsyncIterator from './evaluateXPathToAsyncIterator';
import evaluateXPathToBoolean from './evaluateXPathToBoolean';
import evaluateXPathToFirstNode from './evaluateXPathToFirstNode';
import evaluateXPathToMap from './evaluateXPathToMap';
import evaluateXPathToNodes from './evaluateXPathToNodes';
import evaluateXPathToNumber from './evaluateXPathToNumber';
import evaluateXPathToNumbers from './evaluateXPathToNumbers';
import evaluateXPathToString from './evaluateXPathToString';
import evaluateXPathToStrings from './evaluateXPathToStrings';
import executePendingUpdateList from './executePendingUpdateList';
import Expression from './expressions/Expression';
import type { Bucket } from './expressions/util/Bucket';
import { getBucketsForNode } from './getBuckets';
import compileXPathToJavaScript from './jsCodegen/compileXPathToJavaScript';
import executeJavaScriptCompiledXPath, {
	type CompiledXPathFunction,
} from './jsCodegen/executeJavaScriptCompiledXPath';
import {
	type IAstAccepted,
	type IAstRejected,
	type JavaScriptCompiledXPathResult,
} from './jsCodegen/JavaScriptCompiledXPath';
import type INodesFactory from './nodesFactory/INodesFactory';
import type ISimpleNodesFactory from './nodesFactory/ISimpleNodesFactory';
import parseScript from './parseScript';
import astHelper from './parsing/astHelper';
import compileAstToExpression from './parsing/compileAstToExpression';
import { getAnyStaticCompilationResultFromCache } from './parsing/compiledExpressionCache';
import { type IReturnTypes, ReturnType } from './parsing/convertXDMReturnValue';
import convertXmlToAst from './parsing/convertXmlToAst';
import { performStaticCompilationOnModules } from './parsing/globalModuleCache';
import parseExpression from './parsing/parseExpression';
import { type Profiler, profiler, type XPathPerformanceMeasurement } from './performance';
import precompileXPath from './precompileXPath';
import registerCustomXPathFunction from './registerCustomXPathFunction';
import registerXQueryModule from './registerXQueryModule';
// We do want to deviate from the actual name which is used internally as we do not want to expose
// the types which it uses in the public API
// tslint:disable-next-line: match-default-export-name
import internalCreateTypedValueFactory, {
	type UntypedExternalValue,
	type ValidValue,
} from './types/createTypedValueFactory';

import {
	Language,
	type FunctionNameResolver,
	type LexicalQualifiedName,
	type Logger,
	type NamespaceResolver,
	type Options,
	type ResolvedQualifiedName,
	type XMLSerializer,
} from './types/Options';
import type {
	Attr,
	CDATASection,
	CharacterData,
	Comment,
	Document,
	Element,
	Node,
	ProcessingInstruction,
	Text,
} from './types/Types';

// Hold a simple cache for any XPaths that are parsed but never statically compiled
const partiallyParsedXPathCache = new Map();
function parseXPath(xpathExpression: EvaluableExpression): Expression {
	const cachedExpression = getAnyStaticCompilationResultFromCache(xpathExpression, null, false);
	if (cachedExpression) {
		return cachedExpression;
	}

	if (partiallyParsedXPathCache.has(xpathExpression)) {
		return partiallyParsedXPathCache.get(xpathExpression);
	}

	const ast =
		typeof xpathExpression === 'string'
			? parseExpression(xpathExpression, { allowXQuery: false, version: 4 })
			: // AST is an element: convert to jsonml
			  convertXmlToAst(xpathExpression);

	const queryBody = astHelper.followPath(ast, ['mainModule', 'queryBody', '*']);

	if (queryBody === null) {
		throw new Error('Library modules do not have a specificity');
	}

	const expression = compileAstToExpression(queryBody, {
		allowUpdating: false,
		allowXQuery: false,
	});

	partiallyParsedXPathCache.set(xpathExpression, expression);

	return expression;
}

/**
 * @public
 * @param xpathExpression - The XPath for which a bucket should be retrieved
 */
function getBucketForSelector(xpathExpression: EvaluableExpression): Bucket {
	return parseXPath(xpathExpression).getBucket();
}

/**
 * Compare the specificity of two XPath expressions. This function will return -1 if the second XPath is more specific, 1 if the first one is more specific and 0 if they are equal in specificity.
 *
 * @public
 *
 * @example
 * compareSpecificity('self::a', 'self::a[\@b]') === -1;
 * compareSpecificity('self::a', 'self::a and child::b') === -1;
 * compareSpecificity('self::*', 'self::a') === 1;
 * compareSpecificity('self::a', 'self::a') === 0;
 *
 * @param xpathExpressionA - The first XPath to compare
 * @param xpathExpressionB - The XPath to compare to
 *
 * @returns Either 1, 0, or -1
 */
function compareSpecificity(
	xpathExpressionA: EvaluableExpression,
	xpathExpressionB: EvaluableExpression,
): -1 | 0 | 1 {
	return parseXPath(xpathExpressionA).specificity.compareTo(
		parseXPath(xpathExpressionB).specificity,
	);
}

/**
 * @public
 */
const domFacade = new ExternalDomFacade() as IDomFacade;

// This declaration is needed, as we don't depend anymore on lib.dom.
declare let fontoxpathGlobal: { [s: string]: any };

/* istanbul ignore next */
if (typeof fontoxpathGlobal !== 'undefined') {
	fontoxpathGlobal['compareSpecificity'] = compareSpecificity;
	fontoxpathGlobal['compileXPathToJavaScript'] = compileXPathToJavaScript;
	fontoxpathGlobal['domFacade'] = domFacade;
	fontoxpathGlobal['evaluateXPath'] = evaluateXPath;
	fontoxpathGlobal['evaluateXPathToArray'] = evaluateXPathToArray;
	fontoxpathGlobal['evaluateXPathToAsyncIterator'] = evaluateXPathToAsyncIterator;
	fontoxpathGlobal['evaluateXPathToBoolean'] = evaluateXPathToBoolean;
	fontoxpathGlobal['evaluateXPathToFirstNode'] = evaluateXPathToFirstNode;
	fontoxpathGlobal['evaluateXPathToMap'] = evaluateXPathToMap;
	fontoxpathGlobal['evaluateXPathToNodes'] = evaluateXPathToNodes;
	fontoxpathGlobal['evaluateXPathToNumber'] = evaluateXPathToNumber;
	fontoxpathGlobal['evaluateXPathToNumbers'] = evaluateXPathToNumbers;
	fontoxpathGlobal['evaluateXPathToString'] = evaluateXPathToString;
	fontoxpathGlobal['evaluateXPathToStrings'] = evaluateXPathToStrings;
	fontoxpathGlobal['evaluateUpdatingExpression'] = evaluateUpdatingExpression;
	fontoxpathGlobal['evaluateUpdatingExpressionSync'] = evaluateUpdatingExpressionSync;
	fontoxpathGlobal['executeJavaScriptCompiledXPath'] = executeJavaScriptCompiledXPath;
	fontoxpathGlobal['executePendingUpdateList'] = executePendingUpdateList;
	fontoxpathGlobal['getBucketForSelector'] = getBucketForSelector;
	fontoxpathGlobal['getBucketsForNode'] = getBucketsForNode;
	/** @suppress {deprecated} */
	// @ts-ignore We still need to expose this deprecated API
	fontoxpathGlobal['precompileXPath'] = precompileXPath;
	fontoxpathGlobal['registerXQueryModule'] = registerXQueryModule;
	fontoxpathGlobal['registerCustomXPathFunction'] = registerCustomXPathFunction;
	fontoxpathGlobal['parseScript'] = parseScript;
	fontoxpathGlobal['profiler'] = profiler;
	fontoxpathGlobal['createTypedValueFactory'] = internalCreateTypedValueFactory;
	fontoxpathGlobal['finalizeModuleRegistration'] = performStaticCompilationOnModules;

	// The two enums
	fontoxpathGlobal['Language'] = Language;
	fontoxpathGlobal['ReturnType'] = ReturnType;
}

/**
 * Creates a factory to convert values into a specific type.
 *
 * @param type - The type into which to convert the values.
 *
 * @public
 */
type ExternalTypedValueFactory = (
	type: string,
) => (value: UntypedExternalValue, domFacade: IDomFacade) => unknown;

/**
 * Creates a factory to convert values into a specific type.
 *
 * @public
 */
export const createTypedValueFactory = internalCreateTypedValueFactory as ExternalTypedValueFactory;

export {
	performStaticCompilationOnModules as finalizeModuleRegistration,
	Attr,
	Bucket,
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
	UntypedExternalValue as ValidValueSequence,
	UpdatingOptions,
	ValidValue,
	XPathPerformanceMeasurement,
	compareSpecificity,
	compileXPathToJavaScript,
	domFacade,
	evaluateUpdatingExpression,
	evaluateUpdatingExpressionSync,
	evaluateXPath,
	evaluateXPathToArray,
	evaluateXPathToAsyncIterator,
	evaluateXPathToBoolean,
	evaluateXPathToFirstNode,
	evaluateXPathToMap,
	evaluateXPathToNodes,
	evaluateXPathToNumber,
	evaluateXPathToNumbers,
	evaluateXPathToString,
	evaluateXPathToStrings,
	executeJavaScriptCompiledXPath,
	executePendingUpdateList,
	getBucketForSelector,
	getBucketsForNode,
	parseScript,
	XMLSerializer,
	precompileXPath,
	profiler,
	registerCustomXPathFunction,
	registerXQueryModule,
	EvaluableExpression,
};
