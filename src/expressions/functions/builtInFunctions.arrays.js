"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builtInFunctions_arrays_get_1 = require("./builtInFunctions.arrays.get");
const isSubtypeOf_1 = require("../dataTypes/isSubtypeOf");
const SequenceFactory_1 = require("../dataTypes/SequenceFactory");
const createAtomicValue_1 = require("../dataTypes/createAtomicValue");
const ArrayValue_1 = require("../dataTypes/ArrayValue");
const zipSingleton_1 = require("../util/zipSingleton");
const concatSequences_1 = require("../util/concatSequences");
const iterators_1 = require("../util/iterators");
const createDoublyIterableSequence_1 = require("../util/createDoublyIterableSequence");
const staticallyKnownNamespaces_1 = require("../staticallyKnownNamespaces");
const arraySize = function (_dynamicContext, _executionParameters, _staticContext, arraySequence) {
    return zipSingleton_1.default([arraySequence], ([array]) => SequenceFactory_1.default.singleton(createAtomicValue_1.default(/** @type {!ArrayValue} */ (array).members.length, 'xs:integer')));
};
/**
 * @type {!FunctionDefinitionType}
 */
const arrayPut = function (_dynamicContext, _executionParameters, _staticContext, arraySequence, positionSequence, itemSequence) {
    return zipSingleton_1.default([positionSequence, arraySequence], ([position, array]) => {
        const positionValue = position.value;
        if (positionValue <= 0 || positionValue > /** @type {!ArrayValue} */ (array).members.length) {
            throw new Error('FOAY0001: array position out of bounds.');
        }
        const newMembers = /** @type {!ArrayValue} */ (array).members.concat();
        newMembers.splice(positionValue - 1, 1, createDoublyIterableSequence_1.default(itemSequence));
        return SequenceFactory_1.default.singleton(new ArrayValue_1.default(newMembers));
    });
};
/**
 * @type {!FunctionDefinitionType}
 */
function arrayAppend(_dynamicContext, _executionParameters, _staticContext, arraySequence, itemSequence) {
    return zipSingleton_1.default([arraySequence], ([array]) => {
        const newMembers = /** @type {!ArrayValue} */ (array).members.concat([createDoublyIterableSequence_1.default(itemSequence)]);
        return SequenceFactory_1.default.singleton(new ArrayValue_1.default(newMembers));
    });
}
/**
 * @type {!FunctionDefinitionType}
 */
function arraySubarray(_dynamicContext, _executionParameters, _staticContext, arraySequence, startSequence, lengthSequence) {
    return zipSingleton_1.default([arraySequence, startSequence, lengthSequence], ([array, start, length]) => {
        const startValue = start.value;
        const lengthValue = length.value;
        if (startValue > /** @type {!ArrayValue} */ (array).members.length || startValue <= 0) {
            throw new Error('FOAY0001: subarray start out of bounds.');
        }
        if (lengthValue < 0) {
            throw new Error('FOAY0002: subarray length out of bounds.');
        }
        if (startValue + lengthValue > /** @type {!ArrayValue} */ (array).members.length + 1) {
            throw new Error('FOAY0001: subarray start + length out of bounds.');
        }
        const newMembers = /** @type {!ArrayValue} */ (array).members.slice(startValue - 1, lengthValue + startValue - 1);
        return SequenceFactory_1.default.singleton(new ArrayValue_1.default(newMembers));
    });
}
/**
 * @type {!FunctionDefinitionType}
 */
function arrayRemove(_dynamicContext, _executionParameters, _staticContext, arraySequence, positionSequence) {
    return zipSingleton_1.default([arraySequence], ([array]) => positionSequence.mapAll(allIndices => {
        const indicesToRemove = allIndices.map(value => value.value)
            // Sort them in reverse order, to keep them stable
            .sort((a, b) => b - a)
            .filter((item, i, all) => all[i - 1] !== item);
        const newMembers = /** @type {!ArrayValue} */ (array).members.concat();
        for (let i = 0, l = indicesToRemove.length; i < l; ++i) {
            const position = indicesToRemove[i];
            if (position > /** @type {!ArrayValue} */ (array).members.length || position <= 0) {
                throw new Error('FOAY0001: subarray position out of bounds.');
            }
            newMembers.splice(position - 1, 1);
        }
        return SequenceFactory_1.default.singleton(new ArrayValue_1.default(newMembers));
    }));
}
/**
 * @type {!FunctionDefinitionType}
 */
function arrayInsertBefore(_dynamicContext, _executionParameters, _staticContext, arraySequence, positionSequence, itemSequence) {
    return zipSingleton_1.default([arraySequence, positionSequence], ([array, position]) => {
        const positionValue = position.value;
        if (positionValue > /** @type {!ArrayValue} */ (array).members.length + 1 || positionValue <= 0) {
            throw new Error('FOAY0001: subarray position out of bounds.');
        }
        const newMembers = /** @type {!ArrayValue} */ (array).members.concat();
        newMembers.splice(positionValue - 1, 0, createDoublyIterableSequence_1.default(itemSequence));
        return SequenceFactory_1.default.singleton(new ArrayValue_1.default(newMembers));
    });
}
/**
 * @type {!FunctionDefinitionType}
 */
function arrayReverse(_dynamicContext, _executionParameters, _staticContext, arraySequence) {
    return zipSingleton_1.default([arraySequence], ([array]) => SequenceFactory_1.default.singleton(new ArrayValue_1.default(/** @type {!ArrayValue} */ (array).members.concat().reverse())));
}
/**
 * @type {!FunctionDefinitionType}
 */
function arrayJoin(_dynamicContext, _executionParameters, _staticContext, arraySequence) {
    return arraySequence.mapAll(allArrays => {
        const newMembers = allArrays.reduce((joinedMembers, array) => joinedMembers.concat(/** @type {!ArrayValue} */ (array).members), []);
        return SequenceFactory_1.default.singleton(new ArrayValue_1.default(newMembers));
    });
}
/**
 * @type {!FunctionDefinitionType}
 */
function arrayForEach(dynamicContext, executionParameters, staticContext, arraySequence, functionItemSequence) {
    return zipSingleton_1.default([arraySequence, functionItemSequence], ([array, functionItem]) => {
        const newMembers = /** @type {!ArrayValue} */ (array).members.map(function (member) {
            return createDoublyIterableSequence_1.default(functionItem.value.call(undefined, dynamicContext, executionParameters, staticContext, member()));
        });
        return SequenceFactory_1.default.singleton(new ArrayValue_1.default(newMembers));
    });
}
/**
 * @type {!FunctionDefinitionType}
 */
function arrayFilter(dynamicContext, executionParameters, staticContext, arraySequence, functionItemSequence) {
    return zipSingleton_1.default([arraySequence, functionItemSequence], ([array, functionItem]) => {
        /**
         * @type {!Array<!Sequence>}
         */
        const filterResultSequences = /** @type {!ArrayValue} */ (array).members.map(member => functionItem.value.call(undefined, dynamicContext, executionParameters, staticContext, member()));
        const effectiveBooleanValues = [];
        let done = false;
        return SequenceFactory_1.default.create({
            next: () => {
                if (done) {
                    return iterators_1.DONE_TOKEN;
                }
                let allReady = true;
                for (let i = 0, l = /** @type {!ArrayValue} */ (array).members.length; i < l; ++i) {
                    if (effectiveBooleanValues[i] && effectiveBooleanValues[i].ready) {
                        continue;
                    }
                    const filterResult = filterResultSequences[i];
                    const ebv = filterResult.tryGetEffectiveBooleanValue();
                    if (!ebv.ready) {
                        allReady = false;
                    }
                    effectiveBooleanValues[i] = ebv;
                }
                if (!allReady) {
                    return {
                        done: false,
                        ready: false,
                        promise: Promise.all(effectiveBooleanValues.map(filterResult => filterResult.ready ? Promise.resolve() : filterResult.promise))
                    };
                }
                const newMembers = /** @type {!ArrayValue} */ (array).members
                    .filter((_, i) => effectiveBooleanValues[i].value);
                done = true;
                return iterators_1.ready(new ArrayValue_1.default(newMembers));
            }
        });
    });
}
/**
 * @type {!FunctionDefinitionType}
 */
function arrayFoldLeft(dynamicContext, executionParameters, staticContext, arraySequence, startSequence, functionItemSequence) {
    return zipSingleton_1.default([arraySequence, functionItemSequence], ([array, functionItem]) => /** @type {!ArrayValue} */ (array).members.reduce((accum, member) => functionItem.value.call(undefined, dynamicContext, executionParameters, staticContext, accum, member()), startSequence));
}
/**
 * @type {!FunctionDefinitionType}
 */
function arrayFoldRight(dynamicContext, executionParameters, staticContext, arraySequence, startSequence, functionItemSequence) {
    return zipSingleton_1.default([arraySequence, functionItemSequence], ([array, functionItem]) => /** @type {!ArrayValue} */ (array).members.reduceRight((accum, member) => functionItem.value.call(undefined, dynamicContext, executionParameters, staticContext, accum, member()), startSequence));
}
/**
 * @type {!FunctionDefinitionType}
 */
function arrayForEachPair(dynamicContext, executionParameters, staticContext, arraySequenceA, arraySequenceB, functionItemSequence) {
    return zipSingleton_1.default([arraySequenceA, arraySequenceB, functionItemSequence], ([arrayA, arrayB, functionItem]) => {
        const newMembers = [];
        for (let i = 0, l = Math.min(
        /** @type {!ArrayValue} */ (arrayA).members.length, 
        /** @type {!ArrayValue} */ (arrayB).members.length); i < l; ++i) {
            newMembers[i] = createDoublyIterableSequence_1.default(functionItem.value.call(undefined, dynamicContext, executionParameters, staticContext, 
            /** @type {!ArrayValue} */ (arrayA).members[i](), 
            /** @type {!ArrayValue} */ (arrayB).members[i]()));
        }
        return SequenceFactory_1.default.singleton(new ArrayValue_1.default(newMembers));
    });
}
/**
 * @type {!FunctionDefinitionType}
 */
function arraySort(_dynamicContext, executionParameters, _staticContext, arraySequence) {
    return zipSingleton_1.default([arraySequence], ([array]) => {
        const atomizedMembers = /** @type {!ArrayValue} */ (array).members.map(createSequence => createSequence().atomize(executionParameters));
        return zipSingleton_1.default(atomizedMembers, atomizedItems => {
            const permutations = /** @type {!ArrayValue} */ (array).members
                .map((_, i) => i)
                .sort((indexA, indexB) => atomizedItems[indexA].value > atomizedItems[indexB].value ? 1 : -1);
            return SequenceFactory_1.default.singleton(new ArrayValue_1.default(permutations.map(i => /** @type {!ArrayValue} */ (array).members[i])));
        });
    });
}
/**
 * @type {!FunctionDefinitionType}
 */
function arrayFlatten(__dynamicContext, _executionParameters, _staticContext, itemSequence) {
    return itemSequence.mapAll(items => items.reduce(function flattenItem(flattenedItems, item) {
        if (isSubtypeOf_1.default(item.type, 'array(*)')) {
            return /** @type {ArrayValue} */ (item).members.reduce((flattenedItemsOfMember, member) => member().mapAll(allValues => allValues.reduce(flattenItem, flattenedItemsOfMember)), flattenedItems);
        }
        return concatSequences_1.default([flattenedItems, SequenceFactory_1.default.singleton(item)]);
    }, SequenceFactory_1.default.empty()));
}
exports.default = {
    declarations: [
        {
            namespaceURI: staticallyKnownNamespaces_1.ARRAY_NAMESPACE_URI,
            localName: 'size',
            argumentTypes: ['array(*)'],
            returnType: 'xs:integer',
            callFunction: arraySize
        },
        {
            namespaceURI: staticallyKnownNamespaces_1.ARRAY_NAMESPACE_URI,
            localName: 'get',
            argumentTypes: ['array(*)', 'xs:integer'],
            returnType: 'item()*',
            callFunction: builtInFunctions_arrays_get_1.default
        },
        {
            namespaceURI: staticallyKnownNamespaces_1.ARRAY_NAMESPACE_URI,
            localName: 'put',
            argumentTypes: ['array(*)', 'xs:integer', 'item()*'],
            returnType: 'array(*)',
            callFunction: arrayPut
        },
        {
            namespaceURI: staticallyKnownNamespaces_1.ARRAY_NAMESPACE_URI,
            localName: 'append',
            argumentTypes: ['array(*)', 'item()*'],
            returnType: 'array(*)',
            callFunction: arrayAppend
        },
        {
            namespaceURI: staticallyKnownNamespaces_1.ARRAY_NAMESPACE_URI,
            localName: 'subarray',
            argumentTypes: ['array(*)', 'xs:integer', 'xs:integer'],
            returnType: 'array(*)',
            callFunction: arraySubarray
        },
        {
            namespaceURI: staticallyKnownNamespaces_1.ARRAY_NAMESPACE_URI,
            localName: 'subarray',
            argumentTypes: ['array(*)', 'xs:integer'],
            returnType: 'array(*)',
            callFunction: function (dynamicContext, executionParameters, staticContext, arraySequence, startSequence) {
                const lengthSequence = SequenceFactory_1.default.singleton(createAtomicValue_1.default(arraySequence.first().members.length - startSequence.first().value + 1, 'xs:integer'));
                return arraySubarray(dynamicContext, executionParameters, staticContext, arraySequence, startSequence, lengthSequence);
            }
        },
        {
            namespaceURI: staticallyKnownNamespaces_1.ARRAY_NAMESPACE_URI,
            localName: 'remove',
            argumentTypes: ['array(*)', 'xs:integer*'],
            returnType: 'array(*)',
            callFunction: arrayRemove
        },
        {
            namespaceURI: staticallyKnownNamespaces_1.ARRAY_NAMESPACE_URI,
            localName: 'insert-before',
            argumentTypes: ['array(*)', 'xs:integer', 'item()*'],
            returnType: 'array(*)',
            callFunction: arrayInsertBefore
        },
        {
            namespaceURI: staticallyKnownNamespaces_1.ARRAY_NAMESPACE_URI,
            localName: 'head',
            argumentTypes: ['array(*)'],
            returnType: 'item()*',
            callFunction: function (dynamicContext, executionParameters, _staticContext, arraySequence) {
                return builtInFunctions_arrays_get_1.default(dynamicContext, executionParameters, _staticContext, arraySequence, SequenceFactory_1.default.singleton(createAtomicValue_1.default(1, 'xs:integer')));
            }
        },
        {
            namespaceURI: staticallyKnownNamespaces_1.ARRAY_NAMESPACE_URI,
            localName: 'tail',
            argumentTypes: ['array(*)'],
            returnType: 'item()*',
            callFunction: function (dynamicContext, executionParameters, _staticContext, arraySequence) {
                return arrayRemove(dynamicContext, executionParameters, _staticContext, arraySequence, SequenceFactory_1.default.singleton(createAtomicValue_1.default(1, 'xs:integer')));
            }
        },
        {
            namespaceURI: staticallyKnownNamespaces_1.ARRAY_NAMESPACE_URI,
            localName: 'reverse',
            argumentTypes: ['array(*)'],
            returnType: 'array(*)',
            callFunction: arrayReverse
        },
        {
            namespaceURI: staticallyKnownNamespaces_1.ARRAY_NAMESPACE_URI,
            localName: 'join',
            argumentTypes: ['array(*)*'],
            returnType: 'array(*)',
            callFunction: arrayJoin
        },
        {
            namespaceURI: staticallyKnownNamespaces_1.ARRAY_NAMESPACE_URI,
            localName: 'for-each',
            // TODO: reimplement type checking by parsing the types
            // argumentTypes: ['array(*)', 'function(item()*) as item()*)]
            argumentTypes: ['array(*)', 'function(*)'],
            returnType: 'array(*)',
            callFunction: arrayForEach
        },
        {
            namespaceURI: staticallyKnownNamespaces_1.ARRAY_NAMESPACE_URI,
            localName: 'filter',
            // TODO: reimplement type checking by parsing the types
            // argumentTypes: ['array(*)', 'function(item()*) as xs:boolean)]
            argumentTypes: ['array(*)', 'function(*)'],
            returnType: 'array(*)',
            callFunction: arrayFilter
        },
        {
            namespaceURI: staticallyKnownNamespaces_1.ARRAY_NAMESPACE_URI,
            localName: 'fold-left',
            // TODO: reimplement type checking by parsing the types
            // argumentTypes: ['array(*)', 'item()*', 'function(item()*, item()*) as item())]
            argumentTypes: ['array(*)', 'item()*', 'function(*)'],
            returnType: 'item()*',
            callFunction: arrayFoldLeft
        },
        {
            namespaceURI: staticallyKnownNamespaces_1.ARRAY_NAMESPACE_URI,
            localName: 'fold-right',
            // TODO: reimplement type checking by parsing the types
            // argumentTypes: ['array(*)', 'item()*', 'function(item()*, item()*) as item())]
            argumentTypes: ['array(*)', 'item()*', 'function(*)'],
            returnType: 'item()*',
            callFunction: arrayFoldRight
        },
        {
            namespaceURI: staticallyKnownNamespaces_1.ARRAY_NAMESPACE_URI,
            localName: 'for-each-pair',
            // TODO: reimplement type checking by parsing the types
            // argumentTypes: ['array(*)', 'item()*', 'function(item()*, item()*) as item())]
            argumentTypes: ['array(*)', 'array(*)', 'function(*)'],
            returnType: 'array(*)',
            callFunction: arrayForEachPair
        },
        {
            namespaceURI: staticallyKnownNamespaces_1.ARRAY_NAMESPACE_URI,
            localName: 'sort',
            argumentTypes: ['array(*)'],
            returnType: 'array(*)',
            callFunction: arraySort
        },
        {
            namespaceURI: staticallyKnownNamespaces_1.ARRAY_NAMESPACE_URI,
            localName: 'flatten',
            argumentTypes: ['item()*'],
            returnType: 'item()*',
            callFunction: arrayFlatten
        }
    ],
    functions: {
        append: arrayAppend,
        flatten: arrayFlatten,
        foldLeft: arrayFoldLeft,
        foldRight: arrayFoldRight,
        forEach: arrayForEach,
        forEachPair: arrayForEachPair,
        filter: arrayFilter,
        get: builtInFunctions_arrays_get_1.default,
        insertBefore: arrayInsertBefore,
        join: arrayJoin,
        put: arrayPut,
        remove: arrayRemove,
        reverse: arrayReverse,
        size: arraySize,
        sort: arraySort,
        subArray: arraySubarray
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbHRJbkZ1bmN0aW9ucy5hcnJheXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJidWlsdEluRnVuY3Rpb25zLmFycmF5cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtFQUFxRDtBQUNyRCwwREFBbUQ7QUFDbkQsa0VBQTJEO0FBQzNELHNFQUErRDtBQUMvRCx3REFBaUQ7QUFDakQsdURBQWdEO0FBQ2hELDZEQUFzRDtBQUN0RCxpREFBc0Q7QUFDdEQsdUZBQWdGO0FBRWhGLDRFQUFtRTtBQUluRSxNQUFNLFNBQVMsR0FBMkIsVUFBUyxlQUFlLEVBQUUsb0JBQW9CLEVBQUUsY0FBYyxFQUFFLGFBQWE7SUFDdEgsT0FBTyxzQkFBWSxDQUNsQixDQUFDLGFBQWEsQ0FBQyxFQUNmLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUMseUJBQWUsQ0FBQyxTQUFTLENBQUMsMkJBQWlCLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM5SCxDQUFDLENBQUE7QUFFRDs7R0FFRztBQUNILE1BQU0sUUFBUSxHQUFHLFVBQVMsZUFBZSxFQUFFLG9CQUFvQixFQUFFLGNBQWMsRUFBRSxhQUFhLEVBQUUsZ0JBQWdCLEVBQUUsWUFBWTtJQUM3SCxPQUFPLHNCQUFZLENBQ2xCLENBQUMsZ0JBQWdCLEVBQUUsYUFBYSxDQUFDLEVBQ2pDLENBQUMsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFBRTtRQUNyQixNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDO1FBQ3JDLElBQUksYUFBYSxJQUFJLENBQUMsSUFBSSxhQUFhLEdBQUcsMEJBQTBCLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFO1lBQzVGLE1BQU0sSUFBSSxLQUFLLENBQUMseUNBQXlDLENBQUMsQ0FBQztTQUMz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L0IsSUFBSSxFQUFFLFNBQVM7UUFDZixHQUFHLEVBQUUsUUFBUTtRQUNiLE1BQU0sRUFBRSxXQUFXO1FBQ25CLE9BQU8sRUFBRSxZQUFZO1FBQ3JCLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLFNBQVM7UUFDZixRQUFRLEVBQUUsYUFBYTtLQUN2QjtDQUNELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgYXJyYXlHZXQgZnJvbSAnLi9idWlsdEluRnVuY3Rpb25zLmFycmF5cy5nZXQnO1xuaW1wb3J0IGlzU3VidHlwZU9mIGZyb20gJy4uL2RhdGFUeXBlcy9pc1N1YnR5cGVPZic7XG5pbXBvcnQgU2VxdWVuY2VGYWN0b3J5IGZyb20gJy4uL2RhdGFUeXBlcy9TZXF1ZW5jZUZhY3RvcnknO1xuaW1wb3J0IGNyZWF0ZUF0b21pY1ZhbHVlIGZyb20gJy4uL2RhdGFUeXBlcy9jcmVhdGVBdG9taWNWYWx1ZSc7XG5pbXBvcnQgQXJyYXlWYWx1ZSBmcm9tICcuLi9kYXRhVHlwZXMvQXJyYXlWYWx1ZSc7XG5pbXBvcnQgemlwU2luZ2xldG9uIGZyb20gJy4uL3V0aWwvemlwU2luZ2xldG9uJztcbmltcG9ydCBjb25jYXRTZXF1ZW5jZXMgZnJvbSAnLi4vdXRpbC9jb25jYXRTZXF1ZW5jZXMnO1xuaW1wb3J0IHsgRE9ORV9UT0tFTiwgcmVhZHkgfSBmcm9tICcuLi91dGlsL2l0ZXJhdG9ycyc7XG5pbXBvcnQgY3JlYXRlRG91Ymx5SXRlcmFibGVTZXF1ZW5jZSBmcm9tICcuLi91dGlsL2NyZWF0ZURvdWJseUl0ZXJhYmxlU2VxdWVuY2UnO1xuXG5pbXBvcnQgeyBBUlJBWV9OQU1FU1BBQ0VfVVJJIH0gZnJvbSAnLi4vc3RhdGljYWxseUtub3duTmFtZXNwYWNlcyc7XG5pbXBvcnQgRnVuY3Rpb25EZWZpbml0aW9uVHlwZSBmcm9tICcuL0Z1bmN0aW9uRGVmaW5pdGlvblR5cGUnO1xuaW1wb3J0IElTZXF1ZW5jZSBmcm9tICcuLi9kYXRhVHlwZXMvSVNlcXVlbmNlJztcblxuY29uc3QgYXJyYXlTaXplOiBGdW5jdGlvbkRlZmluaXRpb25UeXBlID0gZnVuY3Rpb24oX2R5bmFtaWNDb250ZXh0LCBfZXhlY3V0aW9uUGFyYW1ldGVycywgX3N0YXRpY0NvbnRleHQsIGFycmF5U2VxdWVuY2UpIHtcblx0cmV0dXJuIHppcFNpbmdsZXRvbihcblx0XHRbYXJyYXlTZXF1ZW5jZV0sXG5cdFx0KFthcnJheV0pID0+IFNlcXVlbmNlRmFjdG9yeS5zaW5nbGV0b24oY3JlYXRlQXRvbWljVmFsdWUoLyoqIEB0eXBlIHshQXJyYXlWYWx1ZX0gKi8gKGFycmF5KS5tZW1iZXJzLmxlbmd0aCwgJ3hzOmludGVnZXInKSkpO1xufVxuXG4vKipcbiAqIEB0eXBlIHshRnVuY3Rpb25EZWZpbml0aW9uVHlwZX1cbiAqL1xuY29uc3QgYXJyYXlQdXQgPSBmdW5jdGlvbihfZHluYW1pY0NvbnRleHQsIF9leGVjdXRpb25QYXJhbWV0ZXJzLCBfc3RhdGljQ29udGV4dCwgYXJyYXlTZXF1ZW5jZSwgcG9zaXRpb25TZXF1ZW5jZSwgaXRlbVNlcXVlbmNlKSB7XG5cdHJldHVybiB6aXBTaW5nbGV0b24oXG5cdFx0W3Bvc2l0aW9uU2VxdWVuY2UsIGFycmF5U2VxdWVuY2VdLFxuXHRcdChbcG9zaXRpb24sIGFycmF5XSkgPT4ge1xuXHRcdFx0Y29uc3QgcG9zaXRpb25WYWx1ZSA9IHBvc2l0aW9uLnZhbHVlO1xuXHRcdFx0aWYgKHBvc2l0aW9uVmFsdWUgPD0gMCB8fCBwb3NpdGlvblZhbHVlID4gLyoqIEB0eXBlIHshQXJyYXlWYWx1ZX0gKi8gKGFycmF5KS5tZW1iZXJzLmxlbmd0aCkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0ZPQVkwMDAxOiBhcnJheSBwb3NpdGlvbiBvdXQgb2YgYm91bmRzLicpO1xuXHRcdFx0fVxuXHRcdFx0XHRjb25zdCBuZXdNZW1iZXJzID0gLyoqIEB0eXBlIHshQXJyYXlWYWx1ZX0gKi8gKGFycmF5KS5tZW1iZXJzLmNvbmNhdCgpO1xuXHRcdFx0bmV3TWVtYmVycy5zcGxpY2UocG9zaXRpb25WYWx1ZSAtIDEsIDEsIGNyZWF0ZURvdWJseUl0ZXJhYmxlU2VxdWVuY2UoaXRlbVNlcXVlbmNlKSk7XG5cdFx0XHRyZXR1cm4gU2VxdWVuY2VGYWN0b3J5LnNpbmdsZXRvbihuZXcgQXJyYXlWYWx1ZShuZXdNZW1iZXJzKSk7XG5cdFx0fSk7XG59XG5cbi8qKlxuICogQHR5cGUgeyFGdW5jdGlvbkRlZmluaXRpb25UeXBlfVxuICovXG5mdW5jdGlvbiBhcnJheUFwcGVuZCAoX2R5bmFtaWNDb250ZXh0LCBfZXhlY3V0aW9uUGFyYW1ldGVycywgX3N0YXRpY0NvbnRleHQsIGFycmF5U2VxdWVuY2UsIGl0ZW1TZXF1ZW5jZSkge1xuXHRyZXR1cm4gemlwU2luZ2xldG9uKFxuXHRcdFthcnJheVNlcXVlbmNlXSxcblx0XHQoW2FycmF5XSkgPT4ge1xuXHRcdFx0Y29uc3QgbmV3TWVtYmVycyA9IC8qKiBAdHlwZSB7IUFycmF5VmFsdWV9ICovIChhcnJheSkubWVtYmVycy5jb25jYXQoW2NyZWF0ZURvdWJseUl0ZXJhYmxlU2VxdWVuY2UoaXRlbVNlcXVlbmNlKV0pO1xuXHRcdFx0cmV0dXJuIFNlcXVlbmNlRmFjdG9yeS5zaW5nbGV0b24obmV3IEFycmF5VmFsdWUobmV3TWVtYmVycykpO1xuXHRcdH0pO1xufVxuXG4vKipcbiAqIEB0eXBlIHshRnVuY3Rpb25EZWZpbml0aW9uVHlwZX1cbiAqL1xuZnVuY3Rpb24gYXJyYXlTdWJhcnJheSAoX2R5bmFtaWNDb250ZXh0LCBfZXhlY3V0aW9uUGFyYW1ldGVycywgX3N0YXRpY0NvbnRleHQsIGFycmF5U2VxdWVuY2UsIHN0YXJ0U2VxdWVuY2UsIGxlbmd0aFNlcXVlbmNlKSB7XG5cdHJldHVybiB6aXBTaW5nbGV0b24oXG5cdFx0W2FycmF5U2VxdWVuY2UsIHN0YXJ0U2VxdWVuY2UsIGxlbmd0aFNlcXVlbmNlXSxcblx0XHQoW2FycmF5LCBzdGFydCwgbGVuZ3RoXSkgPT4ge1xuXHRcdFx0Y29uc3Qgc3RhcnRWYWx1ZSA9IHN0YXJ0LnZhbHVlO1xuXHRcdFx0Y29uc3QgbGVuZ3RoVmFsdWUgPSBsZW5ndGgudmFsdWU7XG5cblx0XHRcdGlmIChzdGFydFZhbHVlID4gLyoqIEB0eXBlIHshQXJyYXlWYWx1ZX0gKi8gKGFycmF5KS5tZW1iZXJzLmxlbmd0aCB8fCBzdGFydFZhbHVlIDw9IDApIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdGT0FZMDAwMTogc3ViYXJyYXkgc3RhcnQgb3V0IG9mIGJvdW5kcy4nKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGxlbmd0aFZhbHVlIDwgMCkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0ZPQVkwMDAyOiBzdWJhcnJheSBsZW5ndGggb3V0IG9mIGJvdW5kcy4nKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHN0YXJ0VmFsdWUgKyBsZW5ndGhWYWx1ZSA+IC8qKiBAdHlwZSB7IUFycmF5VmFsdWV9ICovIChhcnJheSkubWVtYmVycy5sZW5ndGggKyAxKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcignRk9BWTAwMDE6IHN1YmFycmF5IHN0YXJ0ICsgbGVuZ3RoIG91dCBvZiBib3VuZHMuJyk7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IG5ld01lbWJlcnMgPSAvKiogQHR5cGUgeyFBcnJheVZhbHVlfSAqLyAoYXJyYXkpLm1lbWJlcnMuc2xpY2Uoc3RhcnRWYWx1ZSAtIDEsIGxlbmd0aFZhbHVlICsgc3RhcnRWYWx1ZSAtIDEpO1xuXHRcdFx0cmV0dXJuIFNlcXVlbmNlRmFjdG9yeS5zaW5nbGV0b24obmV3IEFycmF5VmFsdWUobmV3TWVtYmVycykpO1xuXHRcdH0pO1xufVxuXG4vKipcbiAqIEB0eXBlIHshRnVuY3Rpb25EZWZpbml0aW9uVHlwZX1cbiAqL1xuZnVuY3Rpb24gYXJyYXlSZW1vdmUgKF9keW5hbWljQ29udGV4dCwgX2V4ZWN1dGlvblBhcmFtZXRlcnMsIF9zdGF0aWNDb250ZXh0LCBhcnJheVNlcXVlbmNlLCBwb3NpdGlvblNlcXVlbmNlKSB7XG5cdHJldHVybiB6aXBTaW5nbGV0b24oXG5cdFx0W2FycmF5U2VxdWVuY2VdLFxuXHRcdChbYXJyYXldKSA9PiBwb3NpdGlvblNlcXVlbmNlLm1hcEFsbChhbGxJbmRpY2VzID0+IHtcblx0XHRcdGNvbnN0IGluZGljZXNUb1JlbW92ZSA9IGFsbEluZGljZXMubWFwKHZhbHVlID0+IHZhbHVlLnZhbHVlKVxuXHRcdFx0Ly8gU29ydCB0aGVtIGluIHJldmVyc2Ugb3JkZXIsIHRvIGtlZXAgdGhlbSBzdGFibGVcblx0XHRcdFx0LnNvcnQoKGEsIGIpID0+IGIgLSBhKVxuXHRcdFx0XHQuZmlsdGVyKChpdGVtLCBpLCBhbGwpID0+IGFsbFtpIC0gMV0gIT09IGl0ZW0pO1xuXG5cdFx0XHRjb25zdCBuZXdNZW1iZXJzID0gLyoqIEB0eXBlIHshQXJyYXlWYWx1ZX0gKi8gKGFycmF5KS5tZW1iZXJzLmNvbmNhdCgpO1xuXHRcdFx0Zm9yIChsZXQgaSA9IDAsIGwgPSBpbmRpY2VzVG9SZW1vdmUubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG5cdFx0XHRcdGNvbnN0IHBvc2l0aW9uID0gaW5kaWNlc1RvUmVtb3ZlW2ldO1xuXHRcdFx0XHRpZiAocG9zaXRpb24gPiAvKiogQHR5cGUgeyFBcnJheVZhbHVlfSAqLyAoYXJyYXkpLm1lbWJlcnMubGVuZ3RoIHx8IHBvc2l0aW9uIDw9IDApIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0ZPQVkwMDAxOiBzdWJhcnJheSBwb3NpdGlvbiBvdXQgb2YgYm91bmRzLicpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdG5ld01lbWJlcnMuc3BsaWNlKHBvc2l0aW9uIC0gMSwgMSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBTZXF1ZW5jZUZhY3Rvcnkuc2luZ2xldG9uKG5ldyBBcnJheVZhbHVlKG5ld01lbWJlcnMpKTtcblx0XHR9KVxuXHQpO1xufVxuXG4vKipcbiAqIEB0eXBlIHshRnVuY3Rpb25EZWZpbml0aW9uVHlwZX1cbiAqL1xuZnVuY3Rpb24gYXJyYXlJbnNlcnRCZWZvcmUgKF9keW5hbWljQ29udGV4dCwgX2V4ZWN1dGlvblBhcmFtZXRlcnMsIF9zdGF0aWNDb250ZXh0LCBhcnJheVNlcXVlbmNlLCBwb3NpdGlvblNlcXVlbmNlLCBpdGVtU2VxdWVuY2UpIHtcblx0cmV0dXJuIHppcFNpbmdsZXRvbihcblx0XHRbYXJyYXlTZXF1ZW5jZSwgcG9zaXRpb25TZXF1ZW5jZV0sXG5cdFx0KFthcnJheSwgcG9zaXRpb25dKSA9PiB7XG5cdFx0XHRjb25zdCBwb3NpdGlvblZhbHVlID0gcG9zaXRpb24udmFsdWU7XG5cblx0XHRcdGlmIChwb3NpdGlvblZhbHVlID4gLyoqIEB0eXBlIHshQXJyYXlWYWx1ZX0gKi8gKGFycmF5KS5tZW1iZXJzLmxlbmd0aCArIDEgfHwgcG9zaXRpb25WYWx1ZSA8PSAwKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcignRk9BWTAwMDE6IHN1YmFycmF5IHBvc2l0aW9uIG91dCBvZiBib3VuZHMuJyk7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IG5ld01lbWJlcnMgPSAvKiogQHR5cGUgeyFBcnJheVZhbHVlfSAqLyAoYXJyYXkpLm1lbWJlcnMuY29uY2F0KCk7XG5cdFx0XHRuZXdNZW1iZXJzLnNwbGljZShwb3NpdGlvblZhbHVlIC0gMSwgMCwgY3JlYXRlRG91Ymx5SXRlcmFibGVTZXF1ZW5jZShpdGVtU2VxdWVuY2UpKTtcblx0XHRcdHJldHVybiBTZXF1ZW5jZUZhY3Rvcnkuc2luZ2xldG9uKG5ldyBBcnJheVZhbHVlKG5ld01lbWJlcnMpKTtcblx0XHR9KTtcbn1cblxuLyoqXG4gKiBAdHlwZSB7IUZ1bmN0aW9uRGVmaW5pdGlvblR5cGV9XG4gKi9cbmZ1bmN0aW9uIGFycmF5UmV2ZXJzZSAoX2R5bmFtaWNDb250ZXh0LCBfZXhlY3V0aW9uUGFyYW1ldGVycywgX3N0YXRpY0NvbnRleHQsIGFycmF5U2VxdWVuY2UpIHtcblx0cmV0dXJuIHppcFNpbmdsZXRvbihcblx0XHRbYXJyYXlTZXF1ZW5jZV0sXG5cdFx0KFthcnJheV0pID0+IFNlcXVlbmNlRmFjdG9yeS5zaW5nbGV0b24obmV3IEFycmF5VmFsdWUoLyoqIEB0eXBlIHshQXJyYXlWYWx1ZX0gKi8gKGFycmF5KS5tZW1iZXJzLmNvbmNhdCgpLnJldmVyc2UoKSkpKTtcbn1cblxuLyoqXG4gKiBAdHlwZSB7IUZ1bmN0aW9uRGVmaW5pdGlvblR5cGV9XG4gKi9cbmZ1bmN0aW9uIGFycmF5Sm9pbiAoX2R5bmFtaWNDb250ZXh0LCBfZXhlY3V0aW9uUGFyYW1ldGVycywgX3N0YXRpY0NvbnRleHQsIGFycmF5U2VxdWVuY2UpIHtcblx0cmV0dXJuIGFycmF5U2VxdWVuY2UubWFwQWxsKGFsbEFycmF5cyA9PiB7XG5cdFx0Y29uc3QgbmV3TWVtYmVycyA9IGFsbEFycmF5cy5yZWR1Y2UoXG5cdFx0XHQoam9pbmVkTWVtYmVycywgYXJyYXkpID0+IGpvaW5lZE1lbWJlcnMuY29uY2F0KC8qKiBAdHlwZSB7IUFycmF5VmFsdWV9ICovIChhcnJheSkubWVtYmVycyksXG5cdFx0XHRbXSk7XG5cdFx0cmV0dXJuIFNlcXVlbmNlRmFjdG9yeS5zaW5nbGV0b24obmV3IEFycmF5VmFsdWUobmV3TWVtYmVycykpO1xuXHR9KTtcbn1cblxuLyoqXG4gKiBAdHlwZSB7IUZ1bmN0aW9uRGVmaW5pdGlvblR5cGV9XG4gKi9cbmZ1bmN0aW9uIGFycmF5Rm9yRWFjaCAoZHluYW1pY0NvbnRleHQsIGV4ZWN1dGlvblBhcmFtZXRlcnMsIHN0YXRpY0NvbnRleHQsIGFycmF5U2VxdWVuY2UsIGZ1bmN0aW9uSXRlbVNlcXVlbmNlKSB7XG5cdHJldHVybiB6aXBTaW5nbGV0b24oXG5cdFx0W2FycmF5U2VxdWVuY2UsIGZ1bmN0aW9uSXRlbVNlcXVlbmNlXSxcblx0XHQoW2FycmF5LCBmdW5jdGlvbkl0ZW1dKSA9PiB7XG5cdFx0XHRjb25zdCBuZXdNZW1iZXJzID0gLyoqIEB0eXBlIHshQXJyYXlWYWx1ZX0gKi8gKGFycmF5KS5tZW1iZXJzLm1hcChmdW5jdGlvbiAobWVtYmVyKSB7XG5cdFx0XHRcdHJldHVybiBjcmVhdGVEb3VibHlJdGVyYWJsZVNlcXVlbmNlKFxuXHRcdFx0XHRcdGZ1bmN0aW9uSXRlbS52YWx1ZS5jYWxsKHVuZGVmaW5lZCwgZHluYW1pY0NvbnRleHQsIGV4ZWN1dGlvblBhcmFtZXRlcnMsIHN0YXRpY0NvbnRleHQsIG1lbWJlcigpKSk7XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBTZXF1ZW5jZUZhY3Rvcnkuc2luZ2xldG9uKG5ldyBBcnJheVZhbHVlKG5ld01lbWJlcnMpKTtcblx0XHR9KTtcbn1cblxuLyoqXG4gKiBAdHlwZSB7IUZ1bmN0aW9uRGVmaW5pdGlvblR5cGV9XG4gKi9cbmZ1bmN0aW9uIGFycmF5RmlsdGVyIChkeW5hbWljQ29udGV4dCwgZXhlY3V0aW9uUGFyYW1ldGVycywgc3RhdGljQ29udGV4dCwgYXJyYXlTZXF1ZW5jZSwgZnVuY3Rpb25JdGVtU2VxdWVuY2UpIHtcblx0cmV0dXJuIHppcFNpbmdsZXRvbihcblx0XHRbYXJyYXlTZXF1ZW5jZSwgZnVuY3Rpb25JdGVtU2VxdWVuY2VdLFxuXHRcdChbYXJyYXksIGZ1bmN0aW9uSXRlbV0pID0+IHtcblx0XHRcdC8qKlxuXHRcdFx0ICogQHR5cGUgeyFBcnJheTwhU2VxdWVuY2U+fVxuXHRcdFx0ICovXG5cdFx0XHRjb25zdCBmaWx0ZXJSZXN1bHRTZXF1ZW5jZXMgPSAvKiogQHR5cGUgeyFBcnJheVZhbHVlfSAqLyAoYXJyYXkpLm1lbWJlcnMubWFwKG1lbWJlciA9PiBmdW5jdGlvbkl0ZW0udmFsdWUuY2FsbChcblx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRkeW5hbWljQ29udGV4dCxcblx0XHRcdFx0ZXhlY3V0aW9uUGFyYW1ldGVycyxcblx0XHRcdFx0c3RhdGljQ29udGV4dCxcblx0XHRcdFx0bWVtYmVyKCkpKTtcblx0XHRcdGNvbnN0IGVmZmVjdGl2ZUJvb2xlYW5WYWx1ZXMgPSBbXTtcblx0XHRcdGxldCBkb25lID0gZmFsc2U7XG5cdFx0XHRyZXR1cm4gU2VxdWVuY2VGYWN0b3J5LmNyZWF0ZSh7XG5cdFx0XHRcdG5leHQ6ICgpID0+IHtcblx0XHRcdFx0XHRpZiAoZG9uZSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIERPTkVfVE9LRU47XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGxldCBhbGxSZWFkeSA9IHRydWU7XG5cdFx0XHRcdFx0Zm9yIChsZXQgaSA9IDAsIGwgPSAvKiogQHR5cGUgeyFBcnJheVZhbHVlfSAqLyAoYXJyYXkpLm1lbWJlcnMubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG5cdFx0XHRcdFx0XHRpZiAoZWZmZWN0aXZlQm9vbGVhblZhbHVlc1tpXSAmJiBlZmZlY3RpdmVCb29sZWFuVmFsdWVzW2ldLnJlYWR5KSB7XG5cdFx0XHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Y29uc3QgZmlsdGVyUmVzdWx0ID0gZmlsdGVyUmVzdWx0U2VxdWVuY2VzW2ldO1xuXHRcdFx0XHRcdFx0Y29uc3QgZWJ2ID0gZmlsdGVyUmVzdWx0LnRyeUdldEVmZmVjdGl2ZUJvb2xlYW5WYWx1ZSgpO1xuXHRcdFx0XHRcdFx0aWYgKCFlYnYucmVhZHkpIHtcblx0XHRcdFx0XHRcdFx0YWxsUmVhZHkgPSBmYWxzZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVmZmVjdGl2ZUJvb2xlYW5WYWx1ZXNbaV0gPSBlYnY7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmICghYWxsUmVhZHkpIHtcblx0XHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRcdGRvbmU6IGZhbHNlLFxuXHRcdFx0XHRcdFx0XHRyZWFkeTogZmFsc2UsXG5cdFx0XHRcdFx0XHRcdHByb21pc2U6IFByb21pc2UuYWxsKGVmZmVjdGl2ZUJvb2xlYW5WYWx1ZXMubWFwKFxuXHRcdFx0XHRcdFx0XHRcdGZpbHRlclJlc3VsdCA9PiBmaWx0ZXJSZXN1bHQucmVhZHkgPyBQcm9taXNlLnJlc29sdmUoKSA6IGZpbHRlclJlc3VsdC5wcm9taXNlKSlcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbnN0IG5ld01lbWJlcnMgPSAvKiogQHR5cGUgeyFBcnJheVZhbHVlfSAqLyAoYXJyYXkpLm1lbWJlcnNcblx0XHRcdFx0XHRcdC5maWx0ZXIoKF8sIGkpID0+IGVmZmVjdGl2ZUJvb2xlYW5WYWx1ZXNbaV0udmFsdWUpO1xuXHRcdFx0XHRcdGRvbmUgPSB0cnVlO1xuXHRcdFx0XHRcdHJldHVybiByZWFkeShuZXcgQXJyYXlWYWx1ZShuZXdNZW1iZXJzKSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0pO1xufVxuXG4vKipcbiAqIEB0eXBlIHshRnVuY3Rpb25EZWZpbml0aW9uVHlwZX1cbiAqL1xuZnVuY3Rpb24gYXJyYXlGb2xkTGVmdCAoZHluYW1pY0NvbnRleHQsIGV4ZWN1dGlvblBhcmFtZXRlcnMsIHN0YXRpY0NvbnRleHQsIGFycmF5U2VxdWVuY2UsIHN0YXJ0U2VxdWVuY2UsIGZ1bmN0aW9uSXRlbVNlcXVlbmNlKSB7XG5cdHJldHVybiB6aXBTaW5nbGV0b24oXG5cdFx0W2FycmF5U2VxdWVuY2UsIGZ1bmN0aW9uSXRlbVNlcXVlbmNlXSxcblx0XHQoW2FycmF5LCBmdW5jdGlvbkl0ZW1dKSA9PiAvKiogQHR5cGUgeyFBcnJheVZhbHVlfSAqLyAoYXJyYXkpLm1lbWJlcnMucmVkdWNlKFxuXHRcdFx0KGFjY3VtLCBtZW1iZXIpID0+IGZ1bmN0aW9uSXRlbS52YWx1ZS5jYWxsKHVuZGVmaW5lZCwgZHluYW1pY0NvbnRleHQsIGV4ZWN1dGlvblBhcmFtZXRlcnMsIHN0YXRpY0NvbnRleHQsIGFjY3VtLCBtZW1iZXIoKSksXG5cdFx0XHRzdGFydFNlcXVlbmNlKSk7XG59XG5cbi8qKlxuICogQHR5cGUgeyFGdW5jdGlvbkRlZmluaXRpb25UeXBlfVxuICovXG5mdW5jdGlvbiBhcnJheUZvbGRSaWdodCAoZHluYW1pY0NvbnRleHQsIGV4ZWN1dGlvblBhcmFtZXRlcnMsIHN0YXRpY0NvbnRleHQsIGFycmF5U2VxdWVuY2UsIHN0YXJ0U2VxdWVuY2UsIGZ1bmN0aW9uSXRlbVNlcXVlbmNlKSB7XG5cdHJldHVybiB6aXBTaW5nbGV0b24oXG5cdFx0W2FycmF5U2VxdWVuY2UsIGZ1bmN0aW9uSXRlbVNlcXVlbmNlXSxcblx0XHQoW2FycmF5LCBmdW5jdGlvbkl0ZW1dKSA9PiAvKiogQHR5cGUgeyFBcnJheVZhbHVlfSAqLyAoYXJyYXkpLm1lbWJlcnMucmVkdWNlUmlnaHQoXG5cdFx0XHQoYWNjdW0sIG1lbWJlcikgPT4gZnVuY3Rpb25JdGVtLnZhbHVlLmNhbGwodW5kZWZpbmVkLCBkeW5hbWljQ29udGV4dCwgZXhlY3V0aW9uUGFyYW1ldGVycywgc3RhdGljQ29udGV4dCwgYWNjdW0sIG1lbWJlcigpKSxcblx0XHRcdHN0YXJ0U2VxdWVuY2UpKTtcbn1cblxuLyoqXG4gKiBAdHlwZSB7IUZ1bmN0aW9uRGVmaW5pdGlvblR5cGV9XG4gKi9cbmZ1bmN0aW9uIGFycmF5Rm9yRWFjaFBhaXIgKGR5bmFtaWNDb250ZXh0LCBleGVjdXRpb25QYXJhbWV0ZXJzLCBzdGF0aWNDb250ZXh0LCBhcnJheVNlcXVlbmNlQSwgYXJyYXlTZXF1ZW5jZUIsIGZ1bmN0aW9uSXRlbVNlcXVlbmNlKSB7XG5cdHJldHVybiB6aXBTaW5nbGV0b24oXG5cdFx0W2FycmF5U2VxdWVuY2VBLCBhcnJheVNlcXVlbmNlQiwgZnVuY3Rpb25JdGVtU2VxdWVuY2VdLFxuXHRcdChbYXJyYXlBLCBhcnJheUIsIGZ1bmN0aW9uSXRlbV0pID0+IHtcblx0XHRcdGNvbnN0IG5ld01lbWJlcnMgPSBbXTtcblx0XHRcdGZvciAobGV0IGkgPSAwLCBsID0gTWF0aC5taW4oXG5cdFx0XHRcdC8qKiBAdHlwZSB7IUFycmF5VmFsdWV9ICovIChhcnJheUEpLm1lbWJlcnMubGVuZ3RoLFxuXHRcdFx0XHQvKiogQHR5cGUgeyFBcnJheVZhbHVlfSAqLyAoYXJyYXlCKS5tZW1iZXJzLmxlbmd0aCk7IGkgPCBsOyArK2kpIHtcblx0XHRcdFx0bmV3TWVtYmVyc1tpXSA9IGNyZWF0ZURvdWJseUl0ZXJhYmxlU2VxdWVuY2UoZnVuY3Rpb25JdGVtLnZhbHVlLmNhbGwoXG5cdFx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRcdGR5bmFtaWNDb250ZXh0LFxuXHRcdFx0XHRcdGV4ZWN1dGlvblBhcmFtZXRlcnMsXG5cdFx0XHRcdFx0c3RhdGljQ29udGV4dCxcblx0XHRcdFx0XHQvKiogQHR5cGUgeyFBcnJheVZhbHVlfSAqLyAoYXJyYXlBKS5tZW1iZXJzW2ldKCksXG5cdFx0XHRcdFx0LyoqIEB0eXBlIHshQXJyYXlWYWx1ZX0gKi8gKGFycmF5QikubWVtYmVyc1tpXSgpKSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBTZXF1ZW5jZUZhY3Rvcnkuc2luZ2xldG9uKG5ldyBBcnJheVZhbHVlKG5ld01lbWJlcnMpKTtcblx0XHR9KTtcbn1cblxuLyoqXG4gKiBAdHlwZSB7IUZ1bmN0aW9uRGVmaW5pdGlvblR5cGV9XG4gKi9cbmZ1bmN0aW9uIGFycmF5U29ydCAoX2R5bmFtaWNDb250ZXh0LCBleGVjdXRpb25QYXJhbWV0ZXJzLCBfc3RhdGljQ29udGV4dCwgYXJyYXlTZXF1ZW5jZSkge1xuXHRyZXR1cm4gemlwU2luZ2xldG9uKFxuXHRcdFthcnJheVNlcXVlbmNlXSxcblx0XHQoW2FycmF5XSkgPT4ge1xuXHRcdFx0Y29uc3QgYXRvbWl6ZWRNZW1iZXJzID0gLyoqIEB0eXBlIHshQXJyYXlWYWx1ZX0gKi8gKGFycmF5KS5tZW1iZXJzLm1hcChjcmVhdGVTZXF1ZW5jZSA9PiBjcmVhdGVTZXF1ZW5jZSgpLmF0b21pemUoZXhlY3V0aW9uUGFyYW1ldGVycykpO1xuXG5cdFx0XHRyZXR1cm4gemlwU2luZ2xldG9uKFxuXHRcdFx0XHRhdG9taXplZE1lbWJlcnMsXG5cdFx0XHRcdGF0b21pemVkSXRlbXMgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IHBlcm11dGF0aW9ucyA9IC8qKiBAdHlwZSB7IUFycmF5VmFsdWV9ICovIChhcnJheSkubWVtYmVyc1xuXHRcdFx0XHRcdFx0Lm1hcCgoXywgaSkgPT4gaSlcblx0XHRcdFx0XHRcdC5zb3J0KChpbmRleEEsIGluZGV4QikgPT4gYXRvbWl6ZWRJdGVtc1tpbmRleEFdLnZhbHVlID4gYXRvbWl6ZWRJdGVtc1tpbmRleEJdLnZhbHVlID8gMSA6IC0xKTtcblx0XHRcdFx0XHRyZXR1cm4gU2VxdWVuY2VGYWN0b3J5LnNpbmdsZXRvbihcblx0XHRcdFx0XHRcdG5ldyBBcnJheVZhbHVlKHBlcm11dGF0aW9ucy5tYXAoaSA9PiAvKiogQHR5cGUgeyFBcnJheVZhbHVlfSAqLyAoYXJyYXkpLm1lbWJlcnNbaV0pKVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH0pO1xuXHRcdH0pO1xufVxuXG4vKipcbiAqIEB0eXBlIHshRnVuY3Rpb25EZWZpbml0aW9uVHlwZX1cbiAqL1xuZnVuY3Rpb24gYXJyYXlGbGF0dGVuIChfX2R5bmFtaWNDb250ZXh0LCBfZXhlY3V0aW9uUGFyYW1ldGVycywgX3N0YXRpY0NvbnRleHQsIGl0ZW1TZXF1ZW5jZSkge1xuXHRyZXR1cm4gaXRlbVNlcXVlbmNlLm1hcEFsbChpdGVtcyA9PiBpdGVtcy5yZWR1Y2UoZnVuY3Rpb24gZmxhdHRlbkl0ZW0gKGZsYXR0ZW5lZEl0ZW1zLCBpdGVtKSB7XG5cdFx0aWYgKGlzU3VidHlwZU9mKGl0ZW0udHlwZSwgJ2FycmF5KCopJykpIHtcblx0XHRcdHJldHVybiAvKiogQHR5cGUge0FycmF5VmFsdWV9ICovIChpdGVtKS5tZW1iZXJzLnJlZHVjZShcblx0XHRcdFx0KGZsYXR0ZW5lZEl0ZW1zT2ZNZW1iZXIsIG1lbWJlcikgPT4gbWVtYmVyKCkubWFwQWxsKFxuXHRcdFx0XHRcdGFsbFZhbHVlcyA9PiBhbGxWYWx1ZXMucmVkdWNlKGZsYXR0ZW5JdGVtLCBmbGF0dGVuZWRJdGVtc09mTWVtYmVyKSksXG5cdFx0XHRcdGZsYXR0ZW5lZEl0ZW1zKTtcblx0XHR9XG5cdFx0cmV0dXJuIGNvbmNhdFNlcXVlbmNlcyhbZmxhdHRlbmVkSXRlbXMsIFNlcXVlbmNlRmFjdG9yeS5zaW5nbGV0b24oaXRlbSldKTtcblx0fSwgU2VxdWVuY2VGYWN0b3J5LmVtcHR5KCkpKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuXHRkZWNsYXJhdGlvbnM6IFtcblx0XHR7XG5cdFx0XHRuYW1lc3BhY2VVUkk6IEFSUkFZX05BTUVTUEFDRV9VUkksXG5cdFx0XHRsb2NhbE5hbWU6ICdzaXplJyxcblx0XHRcdGFyZ3VtZW50VHlwZXM6IFsnYXJyYXkoKiknXSxcblx0XHRcdHJldHVyblR5cGU6ICd4czppbnRlZ2VyJyxcblx0XHRcdGNhbGxGdW5jdGlvbjogYXJyYXlTaXplXG5cdFx0fSxcblxuXHRcdHtcblx0XHRcdG5hbWVzcGFjZVVSSTogQVJSQVlfTkFNRVNQQUNFX1VSSSxcblx0XHRcdGxvY2FsTmFtZTogJ2dldCcsXG5cdFx0XHRhcmd1bWVudFR5cGVzOiBbJ2FycmF5KCopJywgJ3hzOmludGVnZXInXSxcblx0XHRcdHJldHVyblR5cGU6ICdpdGVtKCkqJyxcblx0XHRcdGNhbGxGdW5jdGlvbjogYXJyYXlHZXRcblx0XHR9LFxuXG5cdFx0e1xuXHRcdFx0bmFtZXNwYWNlVVJJOiBBUlJBWV9OQU1FU1BBQ0VfVVJJLFxuXHRcdFx0bG9jYWxOYW1lOiAncHV0Jyxcblx0XHRcdGFyZ3VtZW50VHlwZXM6IFsnYXJyYXkoKiknLCAneHM6aW50ZWdlcicsICdpdGVtKCkqJ10sXG5cdFx0XHRyZXR1cm5UeXBlOiAnYXJyYXkoKiknLFxuXHRcdFx0Y2FsbEZ1bmN0aW9uOiBhcnJheVB1dFxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHRuYW1lc3BhY2VVUkk6IEFSUkFZX05BTUVTUEFDRV9VUkksXG5cdFx0XHRsb2NhbE5hbWU6ICdhcHBlbmQnLFxuXHRcdFx0YXJndW1lbnRUeXBlczogWydhcnJheSgqKScsICdpdGVtKCkqJ10sXG5cdFx0XHRyZXR1cm5UeXBlOiAnYXJyYXkoKiknLFxuXHRcdFx0Y2FsbEZ1bmN0aW9uOiBhcnJheUFwcGVuZFxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHRuYW1lc3BhY2VVUkk6IEFSUkFZX05BTUVTUEFDRV9VUkksXG5cdFx0XHRsb2NhbE5hbWU6ICdzdWJhcnJheScsXG5cdFx0XHRhcmd1bWVudFR5cGVzOiBbJ2FycmF5KCopJywgJ3hzOmludGVnZXInLCAneHM6aW50ZWdlciddLFxuXHRcdFx0cmV0dXJuVHlwZTogJ2FycmF5KCopJyxcblx0XHRcdGNhbGxGdW5jdGlvbjogYXJyYXlTdWJhcnJheVxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHRuYW1lc3BhY2VVUkk6IEFSUkFZX05BTUVTUEFDRV9VUkksXG5cdFx0XHRsb2NhbE5hbWU6ICdzdWJhcnJheScsXG5cdFx0XHRhcmd1bWVudFR5cGVzOiBbJ2FycmF5KCopJywgJ3hzOmludGVnZXInXSxcblx0XHRcdHJldHVyblR5cGU6ICdhcnJheSgqKScsXG5cdFx0XHRjYWxsRnVuY3Rpb246IGZ1bmN0aW9uIChkeW5hbWljQ29udGV4dCwgZXhlY3V0aW9uUGFyYW1ldGVycywgc3RhdGljQ29udGV4dCwgYXJyYXlTZXF1ZW5jZSwgc3RhcnRTZXF1ZW5jZSkge1xuXHRcdFx0XHRjb25zdCBsZW5ndGhTZXF1ZW5jZSA9IFNlcXVlbmNlRmFjdG9yeS5zaW5nbGV0b24oY3JlYXRlQXRvbWljVmFsdWUoXG5cdFx0XHRcdFx0YXJyYXlTZXF1ZW5jZS5maXJzdCgpLm1lbWJlcnMubGVuZ3RoIC0gc3RhcnRTZXF1ZW5jZS5maXJzdCgpLnZhbHVlICsgMSxcblx0XHRcdFx0XHQneHM6aW50ZWdlcicpKTtcblx0XHRcdFx0cmV0dXJuIGFycmF5U3ViYXJyYXkoXG5cdFx0XHRcdFx0ZHluYW1pY0NvbnRleHQsXG5cdFx0XHRcdFx0ZXhlY3V0aW9uUGFyYW1ldGVycyxcblx0XHRcdFx0XHRzdGF0aWNDb250ZXh0LFxuXHRcdFx0XHRcdGFycmF5U2VxdWVuY2UsXG5cdFx0XHRcdFx0c3RhcnRTZXF1ZW5jZSxcblx0XHRcdFx0XHRsZW5ndGhTZXF1ZW5jZSk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdHtcblx0XHRcdG5hbWVzcGFjZVVSSTogQVJSQVlfTkFNRVNQQUNFX1VSSSxcblx0XHRcdGxvY2FsTmFtZTogJ3JlbW92ZScsXG5cdFx0XHRhcmd1bWVudFR5cGVzOiBbJ2FycmF5KCopJywgJ3hzOmludGVnZXIqJ10sXG5cdFx0XHRyZXR1cm5UeXBlOiAnYXJyYXkoKiknLFxuXHRcdFx0Y2FsbEZ1bmN0aW9uOiBhcnJheVJlbW92ZVxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHRuYW1lc3BhY2VVUkk6IEFSUkFZX05BTUVTUEFDRV9VUkksXG5cdFx0XHRsb2NhbE5hbWU6ICdpbnNlcnQtYmVmb3JlJyxcblx0XHRcdGFyZ3VtZW50VHlwZXM6IFsnYXJyYXkoKiknLCAneHM6aW50ZWdlcicsICdpdGVtKCkqJ10sXG5cdFx0XHRyZXR1cm5UeXBlOiAnYXJyYXkoKiknLFxuXHRcdFx0Y2FsbEZ1bmN0aW9uOiBhcnJheUluc2VydEJlZm9yZVxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHRuYW1lc3BhY2VVUkk6IEFSUkFZX05BTUVTUEFDRV9VUkksXG5cdFx0XHRsb2NhbE5hbWU6ICdoZWFkJyxcblx0XHRcdGFyZ3VtZW50VHlwZXM6IFsnYXJyYXkoKiknXSxcblx0XHRcdHJldHVyblR5cGU6ICdpdGVtKCkqJyxcblx0XHRcdGNhbGxGdW5jdGlvbjogZnVuY3Rpb24gKGR5bmFtaWNDb250ZXh0LCBleGVjdXRpb25QYXJhbWV0ZXJzLCBfc3RhdGljQ29udGV4dCwgYXJyYXlTZXF1ZW5jZSkge1xuXHRcdFx0XHRyZXR1cm4gYXJyYXlHZXQoZHluYW1pY0NvbnRleHQsIGV4ZWN1dGlvblBhcmFtZXRlcnMsIF9zdGF0aWNDb250ZXh0LCBhcnJheVNlcXVlbmNlLCBTZXF1ZW5jZUZhY3Rvcnkuc2luZ2xldG9uKGNyZWF0ZUF0b21pY1ZhbHVlKDEsICd4czppbnRlZ2VyJykpKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0e1xuXHRcdFx0bmFtZXNwYWNlVVJJOiBBUlJBWV9OQU1FU1BBQ0VfVVJJLFxuXHRcdFx0bG9jYWxOYW1lOiAndGFpbCcsXG5cdFx0XHRhcmd1bWVudFR5cGVzOiBbJ2FycmF5KCopJ10sXG5cdFx0XHRyZXR1cm5UeXBlOiAnaXRlbSgpKicsXG5cdFx0XHRjYWxsRnVuY3Rpb246IGZ1bmN0aW9uIChkeW5hbWljQ29udGV4dCwgZXhlY3V0aW9uUGFyYW1ldGVycywgX3N0YXRpY0NvbnRleHQsIGFycmF5U2VxdWVuY2UpIHtcblx0XHRcdFx0cmV0dXJuIGFycmF5UmVtb3ZlKGR5bmFtaWNDb250ZXh0LCBleGVjdXRpb25QYXJhbWV0ZXJzLCBfc3RhdGljQ29udGV4dCwgYXJyYXlTZXF1ZW5jZSwgU2VxdWVuY2VGYWN0b3J5LnNpbmdsZXRvbihjcmVhdGVBdG9taWNWYWx1ZSgxLCAneHM6aW50ZWdlcicpKSk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdHtcblx0XHRcdG5hbWVzcGFjZVVSSTogQVJSQVlfTkFNRVNQQUNFX1VSSSxcblx0XHRcdGxvY2FsTmFtZTogJ3JldmVyc2UnLFxuXHRcdFx0YXJndW1lbnRUeXBlczogWydhcnJheSgqKSddLFxuXHRcdFx0cmV0dXJuVHlwZTogJ2FycmF5KCopJyxcblx0XHRcdGNhbGxGdW5jdGlvbjogYXJyYXlSZXZlcnNlXG5cdFx0fSxcblxuXHRcdHtcblx0XHRcdG5hbWVzcGFjZVVSSTogQVJSQVlfTkFNRVNQQUNFX1VSSSxcblx0XHRcdGxvY2FsTmFtZTogJ2pvaW4nLFxuXHRcdFx0YXJndW1lbnRUeXBlczogWydhcnJheSgqKSonXSxcblx0XHRcdHJldHVyblR5cGU6ICdhcnJheSgqKScsXG5cdFx0XHRjYWxsRnVuY3Rpb246IGFycmF5Sm9pblxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHRuYW1lc3BhY2VVUkk6IEFSUkFZX05BTUVTUEFDRV9VUkksXG5cdFx0XHRsb2NhbE5hbWU6ICdmb3ItZWFjaCcsXG5cdFx0XHQvLyBUT0RPOiByZWltcGxlbWVudCB0eXBlIGNoZWNraW5nIGJ5IHBhcnNpbmcgdGhlIHR5cGVzXG5cdFx0XHQvLyBhcmd1bWVudFR5cGVzOiBbJ2FycmF5KCopJywgJ2Z1bmN0aW9uKGl0ZW0oKSopIGFzIGl0ZW0oKSopXVxuXHRcdFx0YXJndW1lbnRUeXBlczogWydhcnJheSgqKScsICdmdW5jdGlvbigqKSddLFxuXHRcdFx0cmV0dXJuVHlwZTogJ2FycmF5KCopJyxcblx0XHRcdGNhbGxGdW5jdGlvbjogYXJyYXlGb3JFYWNoXG5cdFx0fSxcblxuXHRcdHtcblx0XHRcdG5hbWVzcGFjZVVSSTogQVJSQVlfTkFNRVNQQUNFX1VSSSxcblx0XHRcdGxvY2FsTmFtZTogJ2ZpbHRlcicsXG5cdFx0XHQvLyBUT0RPOiByZWltcGxlbWVudCB0eXBlIGNoZWNraW5nIGJ5IHBhcnNpbmcgdGhlIHR5cGVzXG5cdFx0XHQvLyBhcmd1bWVudFR5cGVzOiBbJ2FycmF5KCopJywgJ2Z1bmN0aW9uKGl0ZW0oKSopIGFzIHhzOmJvb2xlYW4pXVxuXHRcdFx0YXJndW1lbnRUeXBlczogWydhcnJheSgqKScsICdmdW5jdGlvbigqKSddLFxuXHRcdFx0cmV0dXJuVHlwZTogJ2FycmF5KCopJyxcblx0XHRcdGNhbGxGdW5jdGlvbjogYXJyYXlGaWx0ZXJcblx0XHR9LFxuXG5cdFx0e1xuXHRcdFx0bmFtZXNwYWNlVVJJOiBBUlJBWV9OQU1FU1BBQ0VfVVJJLFxuXHRcdFx0bG9jYWxOYW1lOiAnZm9sZC1sZWZ0Jyxcblx0XHRcdC8vIFRPRE86IHJlaW1wbGVtZW50IHR5cGUgY2hlY2tpbmcgYnkgcGFyc2luZyB0aGUgdHlwZXNcblx0XHRcdC8vIGFyZ3VtZW50VHlwZXM6IFsnYXJyYXkoKiknLCAnaXRlbSgpKicsICdmdW5jdGlvbihpdGVtKCkqLCBpdGVtKCkqKSBhcyBpdGVtKCkpXVxuXHRcdFx0YXJndW1lbnRUeXBlczogWydhcnJheSgqKScsICdpdGVtKCkqJywgJ2Z1bmN0aW9uKCopJ10sXG5cdFx0XHRyZXR1cm5UeXBlOiAnaXRlbSgpKicsXG5cdFx0XHRjYWxsRnVuY3Rpb246IGFycmF5Rm9sZExlZnRcblx0XHR9LFxuXG5cdFx0e1xuXHRcdFx0bmFtZXNwYWNlVVJJOiBBUlJBWV9OQU1FU1BBQ0VfVVJJLFxuXHRcdFx0bG9jYWxOYW1lOiAnZm9sZC1yaWdodCcsXG5cdFx0XHQvLyBUT0RPOiByZWltcGxlbWVudCB0eXBlIGNoZWNraW5nIGJ5IHBhcnNpbmcgdGhlIHR5cGVzXG5cdFx0XHQvLyBhcmd1bWVudFR5cGVzOiBbJ2FycmF5KCopJywgJ2l0ZW0oKSonLCAnZnVuY3Rpb24oaXRlbSgpKiwgaXRlbSgpKikgYXMgaXRlbSgpKV1cblx0XHRcdGFyZ3VtZW50VHlwZXM6IFsnYXJyYXkoKiknLCAnaXRlbSgpKicsICdmdW5jdGlvbigqKSddLFxuXHRcdFx0cmV0dXJuVHlwZTogJ2l0ZW0oKSonLFxuXHRcdFx0Y2FsbEZ1bmN0aW9uOiBhcnJheUZvbGRSaWdodFxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHRuYW1lc3BhY2VVUkk6IEFSUkFZX05BTUVTUEFDRV9VUkksXG5cdFx0XHRsb2NhbE5hbWU6ICdmb3ItZWFjaC1wYWlyJyxcblx0XHRcdC8vIFRPRE86IHJlaW1wbGVtZW50IHR5cGUgY2hlY2tpbmcgYnkgcGFyc2luZyB0aGUgdHlwZXNcblx0XHRcdC8vIGFyZ3VtZW50VHlwZXM6IFsnYXJyYXkoKiknLCAnaXRlbSgpKicsICdmdW5jdGlvbihpdGVtKCkqLCBpdGVtKCkqKSBhcyBpdGVtKCkpXVxuXHRcdFx0YXJndW1lbnRUeXBlczogWydhcnJheSgqKScsICdhcnJheSgqKScsICdmdW5jdGlvbigqKSddLFxuXHRcdFx0cmV0dXJuVHlwZTogJ2FycmF5KCopJyxcblx0XHRcdGNhbGxGdW5jdGlvbjogYXJyYXlGb3JFYWNoUGFpclxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHRuYW1lc3BhY2VVUkk6IEFSUkFZX05BTUVTUEFDRV9VUkksXG5cdFx0XHRsb2NhbE5hbWU6ICdzb3J0Jyxcblx0XHRcdGFyZ3VtZW50VHlwZXM6IFsnYXJyYXkoKiknXSxcblx0XHRcdHJldHVyblR5cGU6ICdhcnJheSgqKScsXG5cdFx0XHRjYWxsRnVuY3Rpb246IGFycmF5U29ydFxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHRuYW1lc3BhY2VVUkk6IEFSUkFZX05BTUVTUEFDRV9VUkksXG5cdFx0XHRsb2NhbE5hbWU6ICdmbGF0dGVuJyxcblx0XHRcdGFyZ3VtZW50VHlwZXM6IFsnaXRlbSgpKiddLFxuXHRcdFx0cmV0dXJuVHlwZTogJ2l0ZW0oKSonLFxuXHRcdFx0Y2FsbEZ1bmN0aW9uOiBhcnJheUZsYXR0ZW5cblx0XHR9XG5cdF0sXG5cdGZ1bmN0aW9uczoge1xuXHRcdGFwcGVuZDogYXJyYXlBcHBlbmQsXG5cdFx0ZmxhdHRlbjogYXJyYXlGbGF0dGVuLFxuXHRcdGZvbGRMZWZ0OiBhcnJheUZvbGRMZWZ0LFxuXHRcdGZvbGRSaWdodDogYXJyYXlGb2xkUmlnaHQsXG5cdFx0Zm9yRWFjaDogYXJyYXlGb3JFYWNoLFxuXHRcdGZvckVhY2hQYWlyOiBhcnJheUZvckVhY2hQYWlyLFxuXHRcdGZpbHRlcjogYXJyYXlGaWx0ZXIsXG5cdFx0Z2V0OiBhcnJheUdldCxcblx0XHRpbnNlcnRCZWZvcmU6IGFycmF5SW5zZXJ0QmVmb3JlLFxuXHRcdGpvaW46IGFycmF5Sm9pbixcblx0XHRwdXQ6IGFycmF5UHV0LFxuXHRcdHJlbW92ZTogYXJyYXlSZW1vdmUsXG5cdFx0cmV2ZXJzZTogYXJyYXlSZXZlcnNlLFxuXHRcdHNpemU6IGFycmF5U2l6ZSxcblx0XHRzb3J0OiBhcnJheVNvcnQsXG5cdFx0c3ViQXJyYXk6IGFycmF5U3ViYXJyYXlcblx0fVxufTtcbiJdfQ==