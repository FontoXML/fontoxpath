define([
	'fontoxml-blueprints',
	'fontoxml-dom-utils/domInfo',

	'./builtInFunctions.aggregate',

	'../dataTypes/BooleanValue',
	'../dataTypes/DoubleValue',
	'../dataTypes/FloatValue',
	'../dataTypes/IntegerValue',
	'../dataTypes/NodeValue',
	'../dataTypes/QNameValue',
	'../dataTypes/Sequence',
	'../dataTypes/StringValue',
	'../dataTypes/sortNodeValues'
], function (
	blueprints,
	domInfo,

	aggregateBuiltinFunctions,

	BooleanValue,
	DoubleValue,
	FloatValue,
	IntegerValue,
	NodeValue,
	QNameValue,
	Sequence,
	StringValue,
	sortNodeValues
) {
	'use strict';

	var blueprintQuery = blueprints.blueprintQuery;

	function contextItemAsFirstArgument (fn, dynamicContext) {
		return fn(dynamicContext, dynamicContext.contextItem);
	}

	function fnBoolean (dynamicContext, sequence) {
		return Sequence.singleton(sequence.getEffectiveBooleanValue() ? BooleanValue.TRUE : BooleanValue.FALSE);
	}

	function fnConcat (dynamicContext) {
		var stringSequences = Array.from(arguments).slice(1);
		stringSequences = stringSequences.map(function (sequence) { return sequence.atomize(); });
		var strings = stringSequences.map(function (sequence) {
				if (sequence.isEmpty()) {
					return '';
				}
				return sequence.value[0].value;
			});
		return Sequence.singleton(new StringValue(strings.join('')));
	}

	function fnFalse () {
		return Sequence.singleton(BooleanValue.FALSE);
	}

	function fnId (dynamicContext, idrefSequence, targetNodeSequence) {
		var targetNodeValue = targetNodeSequence.value[0];
		if (!targetNodeValue.instanceOfType('node()')) {
			return Sequence.empty();
		}
		var domFacade = dynamicContext.domFacade;
		// TODO: Index ids to optimize this lookup
		var isMatchingIdById = idrefSequence.value.reduce(function (byId, idrefValue) {
				idrefValue.value.split(/\s+/).forEach(function (id) {
					byId[id] = true;
				});
				return byId;
			}, Object.create(null));
		var matchingNodes = blueprintQuery.findDescendants(
				domFacade,
				blueprintQuery.getDocumentNode(domFacade, targetNodeValue.value),
				function (node) {
					// TODO: use the is-id property of attributes / elements
					if (!domInfo.isElement(node)) {
						return false;
					}
					var idAttribute = domFacade.getAttribute(node, 'id');
					if (!idAttribute) {
						return false;
					}
					if (!isMatchingIdById[idAttribute]) {
						return false;
					}
					// Only return the first match, per id
					isMatchingIdById[idAttribute] = false;
					return true;
				}, true);
		return new Sequence(matchingNodes.map(function (node) {
			return new NodeValue(domFacade, node);
		}));
	}

	function fnIdref (dynamicContext, idSequence, targetNodeSequence) {
		var targetNodeValue = targetNodeSequence.value[0];
		if (!targetNodeValue.instanceOfType('node()')) {
			return Sequence.empty();
		}
		var domFacade = dynamicContext.domFacade;
		var isMatchingIdRefById = idSequence.value.reduce(function (byId, idValue) {
				byId[idValue.value] = true;
				return byId;
			}, Object.create(null));
		// TODO: Index idrefs to optimize this lookup
		var matchingNodes = blueprintQuery.findDescendants(
				domFacade,
				blueprintQuery.getDocumentNode(domFacade, targetNodeValue.value),
				function (node) {
					// TODO: use the is-idrefs property of attributes / elements
					if (!domInfo.isElement(node)) {
						return false;
					}
					var idAttribute = domFacade.getAttribute(node, 'idref');
					if (!idAttribute) {
						return false;
					}
					var idRefs = idAttribute.split(/\s+/);
					return idRefs.some(function (idRef) {
						return isMatchingIdRefById[idRef];
					});
				}, true);
		return new Sequence(matchingNodes.map(function (node) {
			return new NodeValue(domFacade, node);
		}));
	}

	function fnLast (dynamicContext) {
		return Sequence.singleton(new IntegerValue(dynamicContext.contextSequence.value.length));
	}

	function fnName (dynamicContext, sequence) {
		if (sequence.isEmpty()) {
			return sequence;
		}
		return fnString(dynamicContext, fnNodeName(dynamicContext, sequence));
	}

	function fnNodeName (dynamicContext, sequence) {
		if (sequence.isEmpty()) {
			return sequence;
		}
		var nodeName = sequence.value[0].nodeName;
		if (nodeName === null) {
			return Sequence.empty();
		}
		return Sequence.singleton(new QNameValue(nodeName));
	}

	function fnNormalizeSpace (dynamicContext, arg) {
		if (arg.isEmpty()) {
			return Sequence.singleton(new StringValue(''));
		}
		var string = arg.value[0].value.trim();
		return Sequence.singleton(new StringValue(string.replace(/\s+/g, ' ')));
	}

	function fnNumber (dynamicContext, sequence) {
		if (sequence.isEmpty()) {
			return Sequence.singleton(new DoubleValue(NaN));
		}
		return Sequence.singleton(DoubleValue.cast(sequence.value[0]));
	}

	function fnPosition (dynamicContext) {
		// Note: +1 because XPath is one-based
		return Sequence.singleton(new IntegerValue(dynamicContext.contextSequence.value.indexOf(dynamicContext.contextItem.value[0]) + 1));
	}

	function fnReverse (dynamicContext, sequence) {
		return new Sequence(sequence.value.reverse());
	}

	function fnStartsWith (dynamicContext, arg1, arg2) {
		var startsWith = !arg2.isEmpty() ? arg2.value[0].value : '';
		if (startsWith.length === 0) {
			return Sequence.singleton(BooleanValue.TRUE);
		}
		var stringToTest = !arg1.isEmpty() ? arg1.value[0].value : '';
		if (stringToTest.length === 0) {
			return Sequence.singleton(BooleanValue.FALSE);
		}
		// TODO: choose a collation, this defines whether eszett (ß) should equal 'ss'
		if (stringToTest.startsWith(startsWith)) {
			return Sequence.singleton(BooleanValue.TRUE);
		}
		return Sequence.singleton(BooleanValue.FALSE);
	}

	function fnEndsWith (dynamicContext, arg1, arg2) {
		var endsWith = !arg2.isEmpty() ? arg2.value[0].value : '';
		if (endsWith.length === 0) {
			return Sequence.singleton(BooleanValue.TRUE);
		}
		var stringToTest = !arg1.isEmpty() ? arg1.value[0].value : '';
		if (stringToTest.length === 0) {
			return Sequence.singleton(BooleanValue.FALSE);
		}
		// TODO: choose a collation, this defines whether eszett (ß) should equal 'ss'
		if (stringToTest.endsWith(endsWith)) {
			return Sequence.singleton(BooleanValue.TRUE);
		}
		return Sequence.singleton(BooleanValue.FALSE);
	}

	function fnString (dynamicContext, sequence) {
		if (sequence.isEmpty()) {
			return Sequence.singleton(new StringValue(''));
		}
		if (sequence.value[0].instanceOfType('node()')) {
			return Sequence.singleton(sequence.value[0].getStringValue());
		}
		return Sequence.singleton(StringValue.cast(sequence.value[0]));
	}

	function fnStringJoin (dynamicContext, sequence, separator) {
		var separatorString = separator.value[0].value,
			joinedString = sequence.value.map(function (stringValue) {
				return stringValue.value;
			}).join(separatorString);
		return Sequence.singleton(new StringValue(joinedString));
	}

	function fnStringLength (dynamicContext, sequence) {
		if (sequence.isEmpty()) {
			return Sequence.singleton(new IntegerValue(0));
		}
		// In ES6, Array.from(💩).length === 1
		return Sequence.singleton(new IntegerValue(Array.from(sequence.value[0].value).length));
	}

	function fnTokenize (dynamicContext, input, pattern, flags) {
		if (input.isEmpty() || input.value[0].value.length === 0) {
			return Sequence.empty();
		}
		var string = input.value[0].value,
			patternString = pattern.value[0].value;
		return new Sequence(
			string.split(new RegExp(patternString))
				.map(function (token) {return new StringValue(token);}));
	}

	function fnTrue () {
		return Sequence.singleton(BooleanValue.TRUE);
	}

	function opTo (dynamicContext, fromValue, toValue) {
		var from = fromValue.value[0].value,
			to = toValue.value[0].value;
		if (from > to) {
			return Sequence.empty();
		}
		// RangeExpr is inclusive: 1 to 3 will make (1,2,3)
		return new Sequence(
			Array.apply(null, {length: to - from + 1})
				.map(function (_, i) {
					return new IntegerValue(from+i);
				}));
	}

	function opExcept (dynamicContext, firstNodes, secondNodes) {
		var allNodes = firstNodes.value.filter(function (nodeA) {
				return secondNodes.value.every(function (nodeB) {
					return nodeA.nodeId !== nodeB.nodeId;
				});
			});
		return new Sequence(sortNodeValues(dynamicContext.domFacade, allNodes));
	}

	function opIntersect (dynamicContext, firstNodes, secondNodes) {
		var allNodes = firstNodes.value.filter(function (nodeA) {
				return secondNodes.value.some(function (nodeB) {
					return nodeA.nodeId === nodeB.nodeId;
				});
			});
		return new Sequence(sortNodeValues(dynamicContext.domFacade, allNodes));
	}

	function fnNot (dynamicContext, sequence) {
		return Sequence.singleton(sequence.getEffectiveBooleanValue() ? BooleanValue.FALSE : BooleanValue.TRUE);
	}

	return [
		{
			name: 'boolean',
			argumentTypes: ['item()*'],
			returnType: 'xs:boolean',
			callFunction: fnBoolean
		},

		{
			name: 'concat',
			argumentTypes: ['xs:anyAtomicType?', 'xs:anyAtomicType?', '...'],
			returnType: 'xs:string',
			callFunction: fnConcat
		},

		{
			name: 'ends-with',
			argumentTypes: ['xs:string?', 'xs:string?'],
			returnType: 'xs:boolean',
			callFunction: fnEndsWith
		},

		{
			name: 'ends-with',
			argumentTypes: ['xs:string?', 'xs:string?', 'xs:string'],
			returnType: 'xs:boolean',
			callFunction: function () {
				throw new Error('Not implemented: Specifying a collation is not supported');
			}
		},

		{
			name: 'false',
			argumentTypes: [],
			returnType: 'xs:boolean',
			callFunction: fnFalse
		},

		{
			name: 'id',
			argumentTypes: ['xs:string*', 'node()'],
			returnType: 'element()*',
			callFunction: fnId
		},

		{
			name: 'id',
			argumentTypes: ['xs:string*'],
			returnType: 'element()*',
			callFunction: function (dynamicContext, strings) {
				return fnId(dynamicContext, strings, dynamicContext.contextItem);
			}
		},

		{
			name: 'idref',
			argumentTypes: ['xs:string*', 'node()'],
			returnType: 'node()*',
			callFunction: fnIdref
		},

		{
			name: 'idref',
			argumentTypes: ['xs:string*'],
			returnType: 'node()*',
			callFunction: function (dynamicContext, strings) {
				return fnIdref(dynamicContext, strings, dynamicContext.contextItem);
			}
		},

		{
			name: 'last',
			argumentTypes: [],
			returnType: 'xs:integer',
			callFunction: fnLast
		},

		{
			name: 'name',
			argumentTypes: ['node()?'],
			returnType: 'xs:string',
			callFunction: fnName
		},

		{
			name: 'name',
			argumentTypes: [],
			returnType: 'xs:string',
			callFunction: contextItemAsFirstArgument.bind(undefined, fnName)
		},

		{
			name: 'node-name',
			argumentTypes: ['node()?'],
			returnType: 'xs:QName?',
			callFunction: fnNodeName
		},

		{
			name: 'node-name',
			argumentTypes: [],
			returnType: 'xs:QName?',
			callFunction: contextItemAsFirstArgument.bind(undefined, fnNodeName)
		},

		{
			name: 'normalize-space',
			argumentTypes: ['xs:string?'],
			returnType: 'xs:string',
			callFunction: fnNormalizeSpace
		},

		{
			name: 'normalize-space',
			argumentTypes: [],
			returnType: 'xs:string',
			callFunction: function (dynamicContext) {
				return fnNormalizeSpace(dynamicContext, fnString(dynamicContext, dynamicContext.contextItem));
			}
		},

		{
			name: 'not',
			argumentTypes: ['item()*'],
			returnType: 'xs:boolean',
			callFunction: fnNot
		},

		{
			name: 'number',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:double',
			callFunction: fnNumber
		},

		{
			name: 'number',
			argumentTypes: [],
			returnType: 'xs:double',
			callFunction: contextItemAsFirstArgument.bind(undefined, fnNumber)
		},

		{
			name: 'op:except',
			argumentTypes: ['node()*', 'node()*'],
			returnType: 'node()*',
			callFunction: opExcept
		},

		{
			name: 'op:intersect',
			argumentTypes: ['node()*', 'node()*'],
			returnType: 'node()*',
			callFunction: opIntersect
		},

		{
			name: 'op:to',
			argumentTypes: ['xs:integer', 'xs:integer'],
			returnType: 'xs:integer*',
			callFunction: opTo
		},

		{
			name: 'position',
			argumentTypes: [],
			returnType: 'xs:integer',
			callFunction: fnPosition
		},

		{
			name: 'reverse',
			argumentTypes: ['item()*'],
			returnType: 'item()*',
			callFunction: fnReverse
		},

		{
			name: 'starts-with',
			argumentTypes: ['xs:string?', 'xs:string?'],
			returnType: 'xs:boolean',
			callFunction: fnStartsWith
		},

		{
			name: 'starts-with',
			argumentTypes: ['xs:string?', 'xs:string?', 'xs:string'],
			returnType: 'xs:boolean',
			callFunction: function () {
				throw new Error('Not implemented: Specifying a collation is not supported');
			}
		},

		{
			name: 'string',
			argumentTypes: ['item()?'],
			returnType: 'xs:string',
			callFunction: fnString
		},

		{
			name: 'string',
			argumentTypes: [],
			returnType: 'xs:string',
			callFunction: contextItemAsFirstArgument.bind(undefined, fnString)
		},

		{
			name: 'string-join',
			argumentTypes: ['xs:string*', 'xs:string'],
			returnType: 'xs:string',
			callFunction: fnStringJoin
		},

		{
			name: 'string-join',
			argumentTypes: ['xs:string*'],
			returnType: 'xs:string',
			callFunction: function (dynamicContext, arg1) {
				return fnStringJoin(dynamicContext, arg1, Sequence.singleton(new StringValue('')));
			}
		},

		{
			name: 'string-length',
			argumentTypes: ['xs:string?'],
			returnType: 'xs:integer',
			callFunction: fnStringLength
		},

		{
			name: 'string-length',
			argumentTypes: [],
			returnType: 'xs:integer',
			callFunction: function (dynamicContext) {
				return fnStringLength(dynamicContext, fnString(dynamicContext, dynamicContext.contextItem));
			}
		},

		{
			name: 'tokenize',
			argumentTypes: ['xs:string?', 'xs:string', 'xs:string'],
			returnType: 'xs:string*',
			callFunction: function (dynamicContext, input, pattern, flags) {
				throw new Error('Not implemented: Using flags in tokenize is not supported');
			}
		},

		{
			name: 'tokenize',
			argumentTypes: ['xs:string?', 'xs:string'],
			returnType: 'xs:string*',
			callFunction: fnTokenize
		},

		{
			name: 'tokenize',
			argumentTypes: ['xs:string?'],
			returnType: 'xs:string*',
			callFunction: function (dynamicContext, input) {
				return fnTokenize(dynamicContext, fnNormalizeSpace(dynamicContext, input), Sequence.singleton(new StringValue(' ')));
			}
		},

		{
			name: 'true',
			argumentTypes: [],
			returnType: 'xs:boolean',
			callFunction: fnTrue
		}
	].concat(aggregateBuiltinFunctions);
});
