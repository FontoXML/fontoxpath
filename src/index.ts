import IDocumentWriter from './documentWriter/IDocumentWriter';
import ExternalDomFacade from './domFacade/ExternalDomFacade';
import IDomFacade from './domFacade/IDomFacade';
import evaluateUpdatingExpression, { UpdatingOptions } from './evaluateUpdatingExpression';
import evaluateUpdatingExpressionSync from './evaluateUpdatingExpressionSync';
import evaluateXPath, { EvaluableExpression, EvaluateXPath } from './evaluateXPath';
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
import { Bucket } from './expressions/util/Bucket';
import { getBucketsForNode } from './getBuckets';
import compileXPathToJavaScript from './jsCodegen/compileXPathToJavaScript';
import executeJavaScriptCompiledXPath, {
	CompiledXPathFunction,
} from './jsCodegen/executeJavaScriptCompiledXPath';
import {
	IAstAccepted,
	IAstRejected,
	JavaScriptCompiledXPathResult,
} from './jsCodegen/JavaScriptCompiledXPath';
import INodesFactory from './nodesFactory/INodesFactory';
import ISimpleNodesFactory from './nodesFactory/ISimpleNodesFactory';
import parseScript from './parseScript';
import astHelper from './parsing/astHelper';
import compileAstToExpression from './parsing/compileAstToExpression';
import {
	getAnyStaticCompilationResultFromCache,
	storeHalfCompiledCompilationResultInCache,
} from './parsing/compiledExpressionCache';
import { IReturnTypes, ReturnType } from './parsing/convertXDMReturnValue';
import convertXmlToAst from './parsing/convertXmlToAst';
import parseExpression from './parsing/parseExpression';
import { Profiler, profiler, XPathPerformanceMeasurement } from './performance';
import precompileXPath from './precompileXPath';
import registerCustomXPathFunction from './registerCustomXPathFunction';
import registerXQueryModule from './registerXQueryModule';
import annotateAst from './typeInference/annotateAST';
import { AnnotationContext } from './typeInference/AnnotationContext';
// We do want to deviate from the actual name which is used internally as we do not want to expose
// the types which it uses in the public API
// tslint:disable-next-line: match-default-export-name
import internalCreateTypedValueFactory, {
	UntypedExternalValue,
	ValidValue,
} from './types/createTypedValueFactory';
import {
	FunctionNameResolver,
	Language,
	LexicalQualifiedName,
	Logger,
	NamespaceResolver,
	Options,
	ResolvedQualifiedName,
	XMLSerializer,
} from './types/Options';
import {
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

function parseXPath(xpathExpression: EvaluableExpression) {
	const cachedExpression = getAnyStaticCompilationResultFromCache(
		xpathExpression,
		'XPath',
		false
	);
	if (cachedExpression) {
		return cachedExpression;
	}

	const ast =
		typeof xpathExpression === 'string'
			? parseExpression(xpathExpression, { allowXQuery: false })
			: // AST is an element: convert to jsonml
			  convertXmlToAst(xpathExpression);

	annotateAst(ast, new AnnotationContext(undefined));

	const queryBody = astHelper.followPath(ast, ['mainModule', 'queryBody', '*']);

	if (queryBody === null) {
		throw new Error('Library modules do not have a specificity');
	}

	const expression = compileAstToExpression(queryBody, {
		allowUpdating: false,
		allowXQuery: false,
	});

	storeHalfCompiledCompilationResultInCache(xpathExpression, 'XPath', expression, false);

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
	xpathExpressionB: EvaluableExpression
): -1 | 0 | 1 {
	return parseXPath(xpathExpressionA).specificity.compareTo(
		parseXPath(xpathExpressionB).specificity
	);
}

/**
 * @public
 */
const domFacade = new ExternalDomFacade() as IDomFacade;

// This declaration is needed, as we don't depend anymore on lib.dom.
declare var fontoxpathGlobal: { [s: string]: any };

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
	type: string
) => (value: UntypedExternalValue, domFacade: IDomFacade) => unknown;

/**
 * Creates a factory to convert values into a specific type.
 *
 * @public
 */
export const createTypedValueFactory = internalCreateTypedValueFactory as ExternalTypedValueFactory;

export {
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
