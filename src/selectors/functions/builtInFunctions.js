define([
	'fontoxml-blueprints',
	'fontoxml-dom-utils/domInfo',

	'../dataTypes/BooleanValue',
	'../dataTypes/DoubleValue',
	'../dataTypes/IntegerValue',
	'../dataTypes/NodeValue',
	'../dataTypes/QNameValue',
	'../dataTypes/Sequence',
	'../dataTypes/StringValue',
	'../dataTypes/sortNodeValues'
], function (
	blueprints,
	domInfo,

	BooleanValue,
	DoubleValue,
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

	function fnCount (dynamicContext, sequence) {
		return Sequence.singleton(new IntegerValue(sequence.value.length));
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
		return Sequence.singleton(new QNameValue(sequence.value[0].nodeName));
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
			typeDescription: ['item()*'],
			callFunction: fnBoolean
		},

		{
			name: 'concat',
			typeDescription: ['xs:anyAtomicType?', 'xs:anyAtomicType?', '...'],
			callFunction: fnConcat
		},

		{
			name: 'count',
			typeDescription: ['item()*'],
			callFunction: fnCount
		},

		{
			name: 'false',
			typeDescription: [],
			callFunction: fnFalse
		},

		{
			name: 'id',
			typeDescription: ['xs:string*', 'node()'],
			callFunction: fnId
		},

		{
			name: 'id',
			typeDescription: ['xs:string*'],
			callFunction: function (dynamicContext, strings) {
				return fnId(dynamicContext, strings, dynamicContext.contextItem);
			}
		},

		{
			name: 'idref',
			typeDescription: ['xs:string*', 'node()'],
			callFunction: fnIdref
		},

		{
			name: 'idref',
			typeDescription: ['xs:string*'],
			callFunction: function (dynamicContext, strings) {
				return fnIdref(dynamicContext, strings, dynamicContext.contextItem);
			}
		},

		{
			name: 'last',
			typeDescription: [],
			callFunction: fnLast
		},

		{
			name: 'name',
			typeDescription: ['node()?'],
			callFunction: fnName
		},

		{
			name: 'name',
			typeDescription: [],
			callFunction: contextItemAsFirstArgument.bind(undefined, fnName)
		},

		{
			name: 'node-name',
			typeDescription: ['node()?'],
			callFunction: fnNodeName
		},

		{
			name: 'node-name',
			typeDescription: [],
			callFunction: contextItemAsFirstArgument.bind(undefined, fnNodeName)
		},

		{
			name: 'normalize-space',
			typeDescription: ['xs:string?'],
			callFunction: fnNormalizeSpace
		},

		{
			name: 'normalize-space',
			typeDescription: [],
			callFunction: function (dynamicContext) {
				return fnNormalizeSpace(dynamicContext, fnString(dynamicContext, dynamicContext.contextItem));
			}
		},

		{
			name: 'not',
			typeDescription: ['item()*'],
			callFunction: fnNot
		},

		{
			name: 'number',
			typeDescription: ['xs:anyAtomicType?'],
			callFunction: fnNumber
		},

		{
			name: 'op:to',
			typeDescription: ['xs:integer', 'xs:integer'],
			callFunction: opTo
		},

		{
			name: 'op:intersect',
			typeDescription: ['node()*', 'node()*'],
			callFunction: opIntersect
		},

		{
			name: 'op:except',
			typeDescription: ['node()*', 'node()*'],
			callFunction: opExcept
		},

		{
			name: 'position',
			typeDescription: [],
			callFunction: fnPosition
		},

		{
			name: 'reverse',
			typeDescription: ['item()*'],
			callFunction: fnReverse
		},

		{
			name: 'string',
			typeDescription: ['item()?'],
			callFunction: fnString
		},

		{
			name: 'string',
			typeDescription: [],
			callFunction: contextItemAsFirstArgument.bind(undefined, fnString)
		},

		{
			name: 'string-join',
			typeDescription: ['xs:string*', 'xs:string'],
			callFunction: fnStringJoin
		},

		{
			name: 'string-join',
			typeDescription: ['xs:string*'],
			callFunction: function (dynamicContext, arg1) {
				return fnStringJoin(dynamicContext, arg1, Sequence.singleton(new StringValue('')));
			}
		},

		{
			name: 'string-length',
			typeDescription: ['xs:string?'],
			callFunction: fnStringLength
		},
		{
			name: 'number',
			typeDescription: [],
			callFunction: contextItemAsFirstArgument.bind(undefined, fnNumber)
		},

		{
			name: 'string-length',
			typeDescription: [],
			callFunction: function (dynamicContext) {
				return fnStringLength(dynamicContext, fnString(dynamicContext, dynamicContext.contextItem));
			}
		},

		{
			name: 'tokenize',
			typeDescription: ['xs:string?', 'xs:string', 'xs:string'],
			callFunction: function (dynamicContext, input, pattern, flags) {
				throw new Error('Not implemented: Using flags in tokenize is not supported');
			}
		},

		{
			name: 'tokenize',
			typeDescription: ['xs:string?', 'xs:string'],
			callFunction: fnTokenize
		},

		{
			name: 'tokenize',
			typeDescription: ['xs:string?'],
			callFunction: function (dynamicContext, input) {
				return fnTokenize(dynamicContext, fnNormalizeSpace(dynamicContext, input), Sequence.singleton(new StringValue(' ')));
			}
		},

		{
			name: 'true',
			typeDescription: [],
			callFunction: fnTrue
		}
	];
});
