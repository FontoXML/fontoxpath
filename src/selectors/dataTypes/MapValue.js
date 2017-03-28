import mapGet from '../functions/builtInFunctions.maps.get';
import Sequence from './Sequence';
import DynamicContext from '../DynamicContext';
import FunctionItem from './FunctionItem';

/**
 * @constructor
 * @extends {FunctionItem}
 * @param   {!Array<!Object<Sequence>>}  keyValuePairs
 */
function MapValue (keyValuePairs) {
	FunctionItem.call(this, /** @type {function(!DynamicContext, !Sequence):!Sequence} */ (function (dynamicContext, key) {
		return mapGet(dynamicContext, Sequence.singleton(this), key);
	}.bind(this)), 'map', ['xs:anyAtomicType'], 1, 'item()*');
	this.keyValuePairs = keyValuePairs;
}

MapValue.prototype = Object.create(FunctionItem.prototype);
MapValue.prototype.constructor = MapValue;
MapValue.prototype.instanceOfType = function (simpleTypeName) {
	return simpleTypeName === 'map(*)' ||
		FunctionItem.prototype.instanceOfType.call(this, simpleTypeName);
};

export default MapValue;
