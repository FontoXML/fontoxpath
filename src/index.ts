import ExternalDomFacade from './domFacade/ExternalDomFacade';
import evaluateUpdatingExpression from './evaluateUpdatingExpression';
import evaluateXPath from './evaluateXPath';
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
import getBucketsForNode from './getBucketsForNode';
import astHelper from './parsing/astHelper';
import compileAstToExpression from './parsing/compileAstToExpression';
import {
	getAnyStaticCompilationResultFromCache,
	storeHalfCompiledCompilationResultInCache
} from './parsing/compiledExpressionCache';
import parseExpression from './parsing/parseExpression';
import precompileXPath from './precompileXPath';
import registerCustomXPathFunction from './registerCustomXPathFunction';
import registerXQueryModule from './registerXQueryModule';
import IDomFacade from './domFacade/IDomFacade';

function parseXPath(xpathString: string) {
	const cachedExpression = getAnyStaticCompilationResultFromCache(xpathString, 'XPath');
	if (cachedExpression) {
		return cachedExpression;
	}

	const ast = parseExpression(xpathString, { allowXQuery: false });
	const queryBody = astHelper.followPath(ast, ['mainModule', 'queryBody', '*']);

	if (queryBody === null) {
		throw new Error('Library modules do not have a specificity');
	}

	const expression = compileAstToExpression(queryBody, {
		allowUpdating: false,
		allowXQuery: false
	});

	storeHalfCompiledCompilationResultInCache(xpathString, 'XPath', expression);

	return expression;
}

/**
 *
 * @param xpathString The XPath for which a buckets hould be retrieved
 */
function getBucketForSelector(xpathString) {
	return parseXPath(xpathString).getBucket();
}

/**
 * Compare the specificity of two XPath expressions. This function will return -1 if the second XPath is more specific, 1 if the first one is more specific and 0 if they are equal in specificity.
 *
 * @example
 * compareSpecificity('self::a', 'self::a[@b]') === -1;
 * compareSpecificity('self::a', 'self::a and child::b') === -1;
 * compareSpecificity('self::*', 'self::a') === 1;
 * compareSpecificity('self::a', 'self::a') === 0;
 *
 * @param xpathStringA
 * @param xpathStringB
 */
function compareSpecificity(xpathStringA, xpathStringB): -1 | 0 | 1 {
	return parseXPath(xpathStringA).specificity.compareTo(parseXPath(xpathStringB).specificity);
}

const domFacade: IDomFacade = new ExternalDomFacade();

/* istanbul ignore next */
if (typeof window !== 'undefined') {
	window['compareSpecificity'] = compareSpecificity;
	window['domFacade'] = domFacade;
	window['evaluateXPath'] = evaluateXPath;
	window['evaluateXPathToArray'] = evaluateXPathToArray;
	window['evaluateXPathToBoolean'] = evaluateXPathToBoolean;
	window['evaluateXPathToAsyncIterator'] = evaluateXPathToAsyncIterator;
	window['evaluateXPathToFirstNode'] = evaluateXPathToFirstNode;
	window['evaluateXPathToMap'] = evaluateXPathToMap;
	window['evaluateXPathToNodes'] = evaluateXPathToNodes;
	window['evaluateXPathToNumber'] = evaluateXPathToNumber;
	window['evaluateXPathToNumbers'] = evaluateXPathToNumbers;
	window['evaluateXPathToString'] = evaluateXPathToString;
	window['evaluateXPathToStrings'] = evaluateXPathToStrings;
	window['evaluateUpdatingExpression'] = evaluateUpdatingExpression;
	window['executePendingUpdateList'] = executePendingUpdateList;
	window['getBucketForSelector'] = getBucketForSelector;
	window['getBucketsForNode'] = getBucketsForNode;
	window['precompileXPath'] = precompileXPath;
	window['registerXQueryModule'] = registerXQueryModule;
	window['registerCustomXPathFunction'] = registerCustomXPathFunction;
}

export {
	IDomFacade,
	domFacade,
	evaluateXPath,
	evaluateXPathToArray,
	evaluateXPathToBoolean,
	evaluateXPathToAsyncIterator,
	evaluateXPathToFirstNode,
	evaluateXPathToMap,
	evaluateXPathToNodes,
	evaluateXPathToNumber,
	evaluateXPathToNumbers,
	evaluateXPathToStrings,
	evaluateUpdatingExpression,
	executePendingUpdateList,
	precompileXPath,
	registerXQueryModule,
	evaluateXPathToString,
	registerCustomXPathFunction,
	getBucketsForNode,
	getBucketForSelector,
	compareSpecificity
};
