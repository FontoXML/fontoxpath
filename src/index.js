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
import createSelectorFromXPath from './parsing/createSelectorFromXPath';
import domFacade from './domBackedDomFacade';

function getBucketForSelector (xpathString) {
	return createSelectorFromXPath(xpathString, { allowXQuery: false }).getBucket();
}

function compareSpecificity (xpathStringA, xpathStringB) {
	return createSelectorFromXPath(xpathStringA, { allowXQuery: false }).specificity
		.compareTo(createSelectorFromXPath(xpathStringB, { allowXQuery: false }).specificity);
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
	evaluateXPathToString,
	registerCustomXPathFunction,
	getBucketsForNode,
	getBucketForSelector,
	compareSpecificity
};
