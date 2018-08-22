import evaluateXPath from './evaluateXPath';
import evaluateXPathToArray from './evaluateXPathToArray';
import evaluateXPathToAsyncIterator from './evaluateXPathToAsyncIterator';
import evaluateXPathToBoolean from './evaluateXPathToBoolean';
import evaluateXPathToFirstNode from './evaluateXPathToFirstNode';
import evaluateXPathToNodes from './evaluateXPathToNodes';
import evaluateXPathToNumber from './evaluateXPathToNumber';
import evaluateXPathToMap from './evaluateXPathToMap';
import evaluateXPathToNumbers from './evaluateXPathToNumbers';
import evaluateXPathToString from './evaluateXPathToString';
import evaluateXPathToStrings from './evaluateXPathToStrings';
import precompileXPath from './precompileXPath';
import getBucketsForNode from './getBucketsForNode';
import registerCustomXPathFunction from './registerCustomXPathFunction';
import registerXQueryModule from './registerXQueryModule';
import parseExpression from './parsing/parseExpression';
import compileAstToExpression from './parsing/compileAstToExpression';
import domFacade from './domBackedDomFacade';

function parseXPath (xpathString) {
	const ast = parseExpression(xpathString, { allowXQuery: false });
	return compileAstToExpression(ast['body'], { allowXQuery: false });
}

function getBucketForSelector (xpathString) {
	return parseXPath(xpathString).getBucket();
}

function compareSpecificity (xpathStringA, xpathStringB) {
	return parseXPath(xpathStringA).specificity.compareTo(parseXPath(xpathStringB).specificity);
}

/**
* @suppress {undefinedVars}
*/
(function () {
	/* istanbul ignore else */
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
		window['getBucketForSelector'] = getBucketForSelector;
		window['getBucketsForNode'] = getBucketsForNode;
		window['precompileXPath'] = precompileXPath;
		window['registerXQueryModule'] = registerXQueryModule;
		window['registerCustomXPathFunction'] = registerCustomXPathFunction;
	}
})();

export {
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
	precompileXPath,
	registerXQueryModule,
	evaluateXPathToString,
	registerCustomXPathFunction,
	getBucketsForNode,
	getBucketForSelector,
	compareSpecificity
};
