"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = [
    {
        variety: 'primitive',
        name: 'item()'
    },
    // anyAtomicType
    {
        variety: 'primitive',
        name: 'xs:anyAtomicType',
        parent: 'item()',
        restrictions: {
            whiteSpace: 'preserve'
        }
    },
    // untypedAtomic
    {
        variety: 'primitive',
        name: 'xs:untypedAtomic',
        parent: 'xs:anyAtomicType'
    },
    // string
    {
        variety: 'primitive',
        name: 'xs:string',
        parent: 'xs:anyAtomicType'
    },
    // boolean
    {
        variety: 'primitive',
        name: 'xs:boolean',
        parent: 'xs:anyAtomicType',
        restrictions: {
            whiteSpace: 'collapse' // fixed
        }
    },
    // decimal
    {
        variety: 'primitive',
        name: 'xs:decimal',
        parent: 'xs:anyAtomicType',
        restrictions: {
            whiteSpace: 'collapse' // fixed
        }
    },
    // float
    {
        variety: 'primitive',
        name: 'xs:float',
        parent: 'xs:anyAtomicType',
        restrictions: {
            whiteSpace: 'collapse' // fixed
        }
    },
    // double
    {
        variety: 'primitive',
        name: 'xs:double',
        parent: 'xs:anyAtomicType',
        restrictions: {
            whiteSpace: 'collapse' // fixed
        }
    },
    // duration
    {
        variety: 'primitive',
        name: 'xs:duration',
        parent: 'xs:anyAtomicType',
        restrictions: {
            whiteSpace: 'collapse' // fixed
        }
    },
    // dateTime
    {
        variety: 'primitive',
        name: 'xs:dateTime',
        parent: 'xs:anyAtomicType',
        restrictions: {
            explicitTimezone: 'optional',
            whiteSpace: 'collapse' // fixed
        }
    },
    // time
    {
        variety: 'primitive',
        name: 'xs:time',
        parent: 'xs:anyAtomicType',
        restrictions: {
            explicitTimezone: 'optional',
            whiteSpace: 'collapse' // fixed
        }
    },
    // date
    {
        variety: 'primitive',
        name: 'xs:date',
        parent: 'xs:anyAtomicType',
        restrictions: {
            explicitTimezone: 'optional',
            whiteSpace: 'collapse' // fixed
        }
    },
    // gYearMonth
    {
        variety: 'primitive',
        name: 'xs:gYearMonth',
        parent: 'xs:anyAtomicType',
        restrictions: {
            explicitTimezone: 'optional',
            whiteSpace: 'collapse' // fixed
        }
    },
    // gYear
    {
        variety: 'primitive',
        name: 'xs:gYear',
        parent: 'xs:anyAtomicType',
        restrictions: {
            explicitTimezone: 'optional',
            whiteSpace: 'collapse' // fixed
        }
    },
    // gMonthDay
    {
        variety: 'primitive',
        name: 'xs:gMonthDay',
        parent: 'xs:anyAtomicType',
        restrictions: {
            explicitTimezone: 'optional',
            whiteSpace: 'collapse' // fixed
        }
    },
    // gDay
    {
        variety: 'primitive',
        name: 'xs:gDay',
        parent: 'xs:anyAtomicType',
        restrictions: {
            explicitTimezone: 'optional',
            whiteSpace: 'collapse' // fixed
        }
    },
    // gMonth
    {
        variety: 'primitive',
        name: 'xs:gMonth',
        parent: 'xs:anyAtomicType',
        restrictions: {
            explicitTimezone: 'optional',
            whiteSpace: 'collapse' // fixed
        }
    },
    // hexBinary
    {
        variety: 'primitive',
        name: 'xs:hexBinary',
        parent: 'xs:anyAtomicType',
        restrictions: {
            whiteSpace: 'collapse' // fixed
        }
    },
    // base64Binary
    {
        variety: 'primitive',
        name: 'xs:base64Binary',
        parent: 'xs:anyAtomicType',
        restrictions: {
            whiteSpace: 'collapse' // fixed
        }
    },
    // anyURI
    {
        variety: 'primitive',
        name: 'xs:anyURI',
        parent: 'xs:anyAtomicType',
        restrictions: {
            whiteSpace: 'collapse' // fixed
        }
    },
    // QName
    {
        variety: 'primitive',
        name: 'xs:QName',
        parent: 'xs:anyAtomicType',
        restrictions: {
            whiteSpace: 'collapse' // fixed
        }
    },
    // NOTATION
    {
        variety: 'primitive',
        name: 'xs:NOTATION',
        parent: 'xs:anyAtomicType',
        restrictions: {
            whiteSpace: 'collapse' // fixed
        }
    },
    // dateTimeStamp
    {
        variety: 'derived',
        name: 'xs:dateTimeStamp',
        base: 'xs:dateTime',
        restrictions: {
            whiteSpace: 'collapse',
            explicitTimezone: 'required' // fixed
        }
    },
    // normalizedString
    {
        variety: 'derived',
        name: 'xs:normalizedString',
        base: 'xs:string',
        restrictions: {
            whiteSpace: 'replace'
        }
    },
    // token
    {
        variety: 'derived',
        name: 'xs:token',
        base: 'xs:normalizedString',
        restrictions: {
            whiteSpace: 'collapse'
        }
    },
    // language (TODO: implement pattern)
    {
        variety: 'derived',
        name: 'xs:language',
        base: 'xs:token',
        restrictions: {
            whiteSpace: 'collapse'
        }
    },
    // NMTOKEN (TODO: implement pattern)
    {
        variety: 'derived',
        name: 'xs:NMTOKEN',
        base: 'xs:token',
        restrictions: {
            whiteSpace: 'collapse'
        }
    },
    // NMTOKENS
    {
        variety: 'list',
        name: 'xs:NMTOKENS',
        type: 'NMTOKEN',
        restrictions: {
            minLength: 1,
            whiteSpace: 'collapse'
        }
    },
    // Name (TODO: implement pattern)
    {
        variety: 'derived',
        name: 'xs:Name',
        base: 'xs:token',
        restrictions: {
            whiteSpace: 'collapse'
        }
    },
    // NCName (TODO: implement pattern)
    {
        variety: 'derived',
        name: 'xs:NCName',
        base: 'xs:Name',
        restrictions: {
            whiteSpace: 'collapse'
        }
    },
    // ID (TODO: implement pattern)
    {
        variety: 'derived',
        name: 'xs:ID',
        base: 'xs:NCName',
        restrictions: {
            whiteSpace: 'collapse'
        }
    },
    // IDREF (TODO: implement pattern)
    {
        variety: 'derived',
        name: 'xs:IDREF',
        base: 'xs:NCName',
        restrictions: {
            whiteSpace: 'collapse'
        }
    },
    // IDREFS
    {
        variety: 'list',
        name: 'xs:IDREFS',
        type: 'IDREF',
        restrictions: {
            minLength: 1,
            whiteSpace: 'collapse'
        }
    },
    // ENTITY (TODO: implement pattern)
    {
        variety: 'derived',
        name: 'xs:ENTITY',
        base: 'xs:NCName',
        restrictions: {
            whiteSpace: 'collapse'
        }
    },
    // ENTITIES
    {
        variety: 'list',
        name: 'xs:ENTITIES',
        type: 'ENTITY',
        restrictions: {
            minLength: 1,
            whiteSpace: 'collapse'
        }
    },
    // integer (TODO: implement pattern)
    {
        variety: 'primitive',
        name: 'xs:integer',
        parent: 'xs:decimal',
        restrictions: {
            fractionDigits: 0,
            whiteSpace: 'collapse' // fixed
        }
    },
    // nonPositiveInteger (TODO: implement pattern)
    {
        variety: 'derived',
        name: 'xs:nonPositiveInteger',
        base: 'xs:integer',
        restrictions: {
            fractionDigits: 0,
            maxInclusive: '0',
            whiteSpace: 'collapse' // fixed
        }
    },
    // negativeInteger (TODO: implement pattern)
    {
        variety: 'derived',
        name: 'xs:negativeInteger',
        base: 'xs:nonPositiveInteger',
        restrictions: {
            fractionDigits: 0,
            maxInclusive: '-1',
            whiteSpace: 'collapse' // fixed
        }
    },
    // long (TODO: implement pattern)
    {
        variety: 'derived',
        name: 'xs:long',
        base: 'xs:integer',
        restrictions: {
            fractionDigits: 0,
            maxInclusive: '9223372036854775807',
            minInclusive: '-9223372036854775808',
            whiteSpace: 'collapse' // fixed
        }
    },
    // int (TODO: implement pattern)
    {
        variety: 'derived',
        name: 'xs:int',
        base: 'xs:long',
        restrictions: {
            fractionDigits: 0,
            maxInclusive: '2147483647',
            minInclusive: '-2147483648',
            whiteSpace: 'collapse' // fixed
        }
    },
    // short (TODO: implement pattern)
    {
        variety: 'derived',
        name: 'xs:short',
        base: 'xs:int',
        restrictions: {
            fractionDigits: 0,
            maxInclusive: '32767',
            minInclusive: '-32768',
            whiteSpace: 'collapse' // fixed
        }
    },
    // byte (TODO: implement pattern)
    {
        variety: 'derived',
        name: 'xs:byte',
        base: 'xs:short',
        restrictions: {
            fractionDigits: 0,
            maxInclusive: '127',
            minInclusive: '-128',
            whiteSpace: 'collapse' // fixed
        }
    },
    // nonNegativeInteger (TODO: implement pattern)
    {
        variety: 'derived',
        name: 'xs:nonNegativeInteger',
        base: 'xs:integer',
        restrictions: {
            fractionDigits: 0,
            minInclusive: '0',
            whiteSpace: 'collapse' // fixed
        }
    },
    // unsignedLong (TODO: implement pattern)
    {
        variety: 'derived',
        name: 'xs:unsignedLong',
        base: 'xs:nonNegativeInteger',
        restrictions: {
            fractionDigits: 0,
            maxInclusive: '18446744073709551615',
            minInclusive: '0',
            whiteSpace: 'collapse' // fixed
        }
    },
    // unsignedInt (TODO: implement pattern)
    {
        variety: 'derived',
        name: 'xs:unsignedInt',
        base: 'xs:unsignedLong',
        restrictions: {
            fractionDigits: 0,
            maxInclusive: '4294967295',
            minInclusive: '0',
            whiteSpace: 'collapse' // fixed
        }
    },
    // unsignedShort (TODO: implement pattern)
    {
        variety: 'derived',
        name: 'xs:unsignedShort',
        base: 'xs:unsignedInt',
        restrictions: {
            fractionDigits: 0,
            maxInclusive: '65535',
            minInclusive: '0',
            whiteSpace: 'collapse' // fixed
        }
    },
    // unsignedByte (TODO: implement pattern)
    {
        variety: 'derived',
        name: 'xs:unsignedByte',
        base: 'xs:unsignedShort',
        restrictions: {
            fractionDigits: 0,
            maxInclusive: '255',
            minInclusive: '0',
            whiteSpace: 'collapse' // fixed
        }
    },
    // positiveInteger (TODO: implement pattern)
    {
        variety: 'derived',
        name: 'xs:positiveInteger',
        base: 'xs:nonNegativeInteger',
        restrictions: {
            fractionDigits: 0,
            minInclusive: '1',
            whiteSpace: 'collapse' // fixed
        }
    },
    // yearMonthDuration (TODO: implement pattern)
    {
        variety: 'derived',
        name: 'xs:yearMonthDuration',
        base: 'xs:duration',
        restrictions: {
            whiteSpace: 'collapse' // fixed
        }
    },
    // dayTimeDuration (TODO: implement pattern)
    {
        variety: 'derived',
        name: 'xs:dayTimeDuration',
        base: 'xs:duration',
        restrictions: {
            whiteSpace: 'collapse' // fixed
        }
    },
    {
        variety: 'derived',
        name: 'function(*)',
        base: 'item()'
    },
    {
        variety: 'union',
        name: 'xs:error',
        memberTypes: []
    },
    {
        variety: 'derived',
        name: 'map(*)',
        base: 'function(*)'
    },
    {
        variety: 'derived',
        name: 'array(*)',
        base: 'function(*)'
    },
    {
        variety: 'primitive',
        name: 'node()',
        parent: 'item()'
    },
    {
        variety: 'derived',
        name: 'element()',
        base: 'node()'
    },
    {
        variety: 'derived',
        name: 'comment()',
        base: 'node()'
    },
    {
        variety: 'derived',
        name: 'attribute()',
        base: 'node()'
    },
    {
        variety: 'derived',
        name: 'text()',
        base: 'node()'
    },
    {
        variety: 'derived',
        name: 'processing-instruction()',
        base: 'node()'
    },
    {
        variety: 'derived',
        name: 'document()',
        base: 'node()'
    },
    {
        variety: 'union',
        name: 'xs:numeric',
        memberTypes: ['xs:decimal', 'xs:integer', 'xs:float', 'xs:double']
    }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbHRpbk1vZGVscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJ1aWx0aW5Nb2RlbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxrQkFBZTtJQUNkO1FBQ0MsT0FBTyxFQUFFLFdBQVc7UUFDcEIsSUFBSSxFQUFFLFFBQVE7S0FDZDtJQUVELGdCQUFnQjtJQUNoQjtRQUNDLE9BQU8sRUFBRSxXQUFXO1FBQ3BCLElBQUksRUFBRSxrQkFBa0I7UUFDeEIsTUFBTSxFQUFFLFFBQVE7UUFDaEIsWUFBWSxFQUFFO1lBQ2IsVUFBVSxFQUFFLFVBQVU7U0FDdEI7S0FDRDtJQUVELGdCQUFnQjtJQUNoQjtRQUNDLE9BQU8sRUFBRSxXQUFXO1FBQ3BCLElBQUksRUFBRSxrQkFBa0I7UUFDeEIsTUFBTSxFQUFFLGtCQUFrQjtLQUMxQjtJQUVELFNBQVM7SUFDVDtRQUNDLE9BQU8sRUFBRSxXQUFXO1FBQ3BCLElBQUksRUFBRSxXQUFXO1FBQ2pCLE1BQU0sRUFBRSxrQkFBa0I7S0FDMUI7SUFFRCxVQUFVO0lBQ1Y7UUFDQyxPQUFPLEVBQUUsV0FBVztRQUNwQixJQUFJLEVBQUUsWUFBWTtRQUNsQixNQUFNLEVBQUUsa0JBQWtCO1FBQzFCLFlBQVksRUFBRTtZQUNiLFVBQVUsRUFBRSxVQUFVLENBQUMsUUFBUTtTQUMvQjtLQUNEO0lBRUQsVUFBVTtJQUNWO1FBQ0MsT0FBTyxFQUFFLFdBQVc7UUFDcEIsSUFBSSxFQUFFLFlBQVk7UUFDbEIsTUFBTSxFQUFFLGtCQUFrQjtRQUMxQixZQUFZLEVBQUU7WUFDYixVQUFVLEVBQUUsVUFBVSxDQUFDLFFBQVE7U0FDL0I7S0FDRDtJQUVELFFBQVE7SUFDUjtRQUNDLE9BQU8sRUFBRSxXQUFXO1FBQ3BCLElBQUksRUFBRSxVQUFVO1FBQ2hCLE1BQU0sRUFBRSxrQkFBa0I7UUFDMUIsWUFBWSxFQUFFO1lBQ2IsVUFBVSxFQUFFLFVBQVUsQ0FBQyxRQUFRO1NBQy9CO0tBQ0Q7SUFFRCxTQUFTO0lBQ1Q7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akIsSUFBSSxFQUFFLFFBQVE7S0FDZDtJQUVEO1FBQ0MsT0FBTyxFQUFFLFNBQVM7UUFDbEIsSUFBSSxFQUFFLGFBQWE7UUFDbkIsSUFBSSxFQUFFLFFBQVE7S0FDZDtJQUVEO1FBQ0MsT0FBTyxFQUFFLFNBQVM7UUFDbEIsSUFBSSxFQUFFLFFBQVE7UUFDZCxJQUFJLEVBQUUsUUFBUTtLQUNkO0lBRUQ7UUFDQyxPQUFPLEVBQUUsU0FBUztRQUNsQixJQUFJLEVBQUUsMEJBQTBCO1FBQ2hDLElBQUksRUFBRSxRQUFRO0tBQ2Q7SUFFRDtRQUNDLE9BQU8sRUFBRSxTQUFTO1FBQ2xCLElBQUksRUFBRSxZQUFZO1FBQ2xCLElBQUksRUFBRSxRQUFRO0tBQ2Q7SUFFRDtRQUNDLE9BQU8sRUFBRSxPQUFPO1FBQ2hCLElBQUksRUFBRSxZQUFZO1FBQ2xCLFdBQVcsRUFBRSxDQUFDLFlBQVksRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLFdBQVcsQ0FBQztLQUNsRTtDQUNELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBbXG5cdHtcblx0XHR2YXJpZXR5OiAncHJpbWl0aXZlJyxcblx0XHRuYW1lOiAnaXRlbSgpJ1xuXHR9LFxuXG5cdC8vIGFueUF0b21pY1R5cGVcblx0e1xuXHRcdHZhcmlldHk6ICdwcmltaXRpdmUnLFxuXHRcdG5hbWU6ICd4czphbnlBdG9taWNUeXBlJyxcblx0XHRwYXJlbnQ6ICdpdGVtKCknLFxuXHRcdHJlc3RyaWN0aW9uczoge1xuXHRcdFx0d2hpdGVTcGFjZTogJ3ByZXNlcnZlJ1xuXHRcdH1cblx0fSxcblxuXHQvLyB1bnR5cGVkQXRvbWljXG5cdHtcblx0XHR2YXJpZXR5OiAncHJpbWl0aXZlJyxcblx0XHRuYW1lOiAneHM6dW50eXBlZEF0b21pYycsXG5cdFx0cGFyZW50OiAneHM6YW55QXRvbWljVHlwZSdcblx0fSxcblxuXHQvLyBzdHJpbmdcblx0e1xuXHRcdHZhcmlldHk6ICdwcmltaXRpdmUnLFxuXHRcdG5hbWU6ICd4czpzdHJpbmcnLFxuXHRcdHBhcmVudDogJ3hzOmFueUF0b21pY1R5cGUnXG5cdH0sXG5cblx0Ly8gYm9vbGVhblxuXHR7XG5cdFx0dmFyaWV0eTogJ3ByaW1pdGl2ZScsXG5cdFx0bmFtZTogJ3hzOmJvb2xlYW4nLFxuXHRcdHBhcmVudDogJ3hzOmFueUF0b21pY1R5cGUnLFxuXHRcdHJlc3RyaWN0aW9uczoge1xuXHRcdFx0d2hpdGVTcGFjZTogJ2NvbGxhcHNlJyAvLyBmaXhlZFxuXHRcdH1cblx0fSxcblxuXHQvLyBkZWNpbWFsXG5cdHtcblx0XHR2YXJpZXR5OiAncHJpbWl0aXZlJyxcblx0XHRuYW1lOiAneHM6ZGVjaW1hbCcsXG5cdFx0cGFyZW50OiAneHM6YW55QXRvbWljVHlwZScsXG5cdFx0cmVzdHJpY3Rpb25zOiB7XG5cdFx0XHR3aGl0ZVNwYWNlOiAnY29sbGFwc2UnIC8vIGZpeGVkXG5cdFx0fVxuXHR9LFxuXG5cdC8vIGZsb2F0XG5cdHtcblx0XHR2YXJpZXR5OiAncHJpbWl0aXZlJyxcblx0XHRuYW1lOiAneHM6ZmxvYXQnLFxuXHRcdHBhcmVudDogJ3hzOmFueUF0b21pY1R5cGUnLFxuXHRcdHJlc3RyaWN0aW9uczoge1xuXHRcdFx0d2hpdGVTcGFjZTogJ2NvbGxhcHNlJyAvLyBmaXhlZFxuXHRcdH1cblx0fSxcblxuXHQvLyBkb3VibGVcblx0e1xuXHRcdHZhcmlldHk6ICdwcmltaXRpdmUnLFxuXHRcdG5hbWU6ICd4czpkb3VibGUnLFxuXHRcdHBhcmVudDogJ3hzOmFueUF0b21pY1R5cGUnLFxuXHRcdHJlc3RyaWN0aW9uczoge1xuXHRcdFx0d2hpdGVTcGFjZTogJ2NvbGxhcHNlJyAvLyBmaXhlZFxuXHRcdH1cblx0fSxcblxuXHQvLyBkdXJhdGlvblxuXHR7XG5cdFx0dmFyaWV0eTogJ3ByaW1pdGl2ZScsXG5cdFx0bmFtZTogJ3hzOmR1cmF0aW9uJyxcblx0XHRwYXJlbnQ6ICd4czphbnlBdG9taWNUeXBlJyxcblx0XHRyZXN0cmljdGlvbnM6IHtcblx0XHRcdHdoaXRlU3BhY2U6ICdjb2xsYXBzZScgLy8gZml4ZWRcblx0XHR9XG5cdH0sXG5cblx0Ly8gZGF0ZVRpbWVcblx0e1xuXHRcdHZhcmlldHk6ICdwcmltaXRpdmUnLFxuXHRcdG5hbWU6ICd4czpkYXRlVGltZScsXG5cdFx0cGFyZW50OiAneHM6YW55QXRvbWljVHlwZScsXG5cdFx0cmVzdHJpY3Rpb25zOiB7XG5cdFx0XHRleHBsaWNpdFRpbWV6b25lOiAnb3B0aW9uYWwnLFxuXHRcdFx0d2hpdGVTcGFjZTogJ2NvbGxhcHNlJyAvLyBmaXhlZFxuXHRcdH1cblx0fSxcblxuXHQvLyB0aW1lXG5cdHtcblx0XHR2YXJpZXR5OiAncHJpbWl0aXZlJyxcblx0XHRuYW1lOiAneHM6dGltZScsXG5cdFx0cGFyZW50OiAneHM6YW55QXRvbWljVHlwZScsXG5cdFx0cmVzdHJpY3Rpb25zOiB7XG5cdFx0XHRleHBsaWNpdFRpbWV6b25lOiAnb3B0aW9uYWwnLFxuXHRcdFx0d2hpdGVTcGFjZTogJ2NvbGxhcHNlJyAvLyBmaXhlZFxuXHRcdH1cblx0fSxcblxuXHQvLyBkYXRlXG5cdHtcblx0XHR2YXJpZXR5OiAncHJpbWl0aXZlJyxcblx0XHRuYW1lOiAneHM6ZGF0ZScsXG5cdFx0cGFyZW50OiAneHM6YW55QXRvbWljVHlwZScsXG5cdFx0cmVzdHJpY3Rpb25zOiB7XG5cdFx0XHRleHBsaWNpdFRpbWV6b25lOiAnb3B0aW9uYWwnLFxuXHRcdFx0d2hpdGVTcGFjZTogJ2NvbGxhcHNlJyAvLyBmaXhlZFxuXHRcdH1cblx0fSxcblxuXHQvLyBnWWVhck1vbnRoXG5cdHtcblx0XHR2YXJpZXR5OiAncHJpbWl0aXZlJyxcblx0XHRuYW1lOiAneHM6Z1llYXJNb250aCcsXG5cdFx0cGFyZW50OiAneHM6YW55QXRvbWljVHlwZScsXG5cdFx0cmVzdHJpY3Rpb25zOiB7XG5cdFx0XHRleHBsaWNpdFRpbWV6b25lOiAnb3B0aW9uYWwnLFxuXHRcdFx0d2hpdGVTcGFjZTogJ2NvbGxhcHNlJyAvLyBmaXhlZFxuXHRcdH1cblx0fSxcblxuXHQvLyBnWWVhclxuXHR7XG5cdFx0dmFyaWV0eTogJ3ByaW1pdGl2ZScsXG5cdFx0bmFtZTogJ3hzOmdZZWFyJyxcblx0XHRwYXJlbnQ6ICd4czphbnlBdG9taWNUeXBlJyxcblx0XHRyZXN0cmljdGlvbnM6IHtcblx0XHRcdGV4cGxpY2l0VGltZXpvbmU6ICdvcHRpb25hbCcsXG5cdFx0XHR3aGl0ZVNwYWNlOiAnY29sbGFwc2UnIC8vIGZpeGVkXG5cdFx0fVxuXHR9LFxuXG5cdC8vIGdNb250aERheVxuXHR7XG5cdFx0dmFyaWV0eTogJ3ByaW1pdGl2ZScsXG5cdFx0bmFtZTogJ3hzOmdNb250aERheScsXG5cdFx0cGFyZW50OiAneHM6YW55QXRvbWljVHlwZScsXG5cdFx0cmVzdHJpY3Rpb25zOiB7XG5cdFx0XHRleHBsaWNpdFRpbWV6b25lOiAnb3B0aW9uYWwnLFxuXHRcdFx0d2hpdGVTcGFjZTogJ2NvbGxhcHNlJyAvLyBmaXhlZFxuXHRcdH1cblx0fSxcblxuXHQvLyBnRGF5XG5cdHtcblx0XHR2YXJpZXR5OiAncHJpbWl0aXZlJyxcblx0XHRuYW1lOiAneHM6Z0RheScsXG5cdFx0cGFyZW50OiAneHM6YW55QXRvbWljVHlwZScsXG5cdFx0cmVzdHJpY3Rpb25zOiB7XG5cdFx0XHRleHBsaWNpdFRpbWV6b25lOiAnb3B0aW9uYWwnLFxuXHRcdFx0d2hpdGVTcGFjZTogJ2NvbGxhcHNlJyAvLyBmaXhlZFxuXHRcdH1cblx0fSxcblxuXHQvLyBnTW9udGhcblx0e1xuXHRcdHZhcmlldHk6ICdwcmltaXRpdmUnLFxuXHRcdG5hbWU6ICd4czpnTW9udGgnLFxuXHRcdHBhcmVudDogJ3hzOmFueUF0b21pY1R5cGUnLFxuXHRcdHJlc3RyaWN0aW9uczoge1xuXHRcdFx0ZXhwbGljaXRUaW1lem9uZTogJ29wdGlvbmFsJyxcblx0XHRcdHdoaXRlU3BhY2U6ICdjb2xsYXBzZScgLy8gZml4ZWRcblx0XHR9XG5cdH0sXG5cblx0Ly8gaGV4QmluYXJ5XG5cdHtcblx0XHR2YXJpZXR5OiAncHJpbWl0aXZlJyxcblx0XHRuYW1lOiAneHM6aGV4QmluYXJ5Jyxcblx0XHRwYXJlbnQ6ICd4czphbnlBdG9taWNUeXBlJyxcblx0XHRyZXN0cmljdGlvbnM6IHtcblx0XHRcdHdoaXRlU3BhY2U6ICdjb2xsYXBzZScgLy8gZml4ZWRcblx0XHR9XG5cdH0sXG5cblx0Ly8gYmFzZTY0QmluYXJ5XG5cdHtcblx0XHR2YXJpZXR5OiAncHJpbWl0aXZlJyxcblx0XHRuYW1lOiAneHM6YmFzZTY0QmluYXJ5Jyxcblx0XHRwYXJlbnQ6ICd4czphbnlBdG9taWNUeXBlJyxcblx0XHRyZXN0cmljdGlvbnM6IHtcblx0XHRcdHdoaXRlU3BhY2U6ICdjb2xsYXBzZScgLy8gZml4ZWRcblx0XHR9XG5cdH0sXG5cblx0Ly8gYW55VVJJXG5cdHtcblx0XHR2YXJpZXR5OiAncHJpbWl0aXZlJyxcblx0XHRuYW1lOiAneHM6YW55VVJJJyxcblx0XHRwYXJlbnQ6ICd4czphbnlBdG9taWNUeXBlJyxcblx0XHRyZXN0cmljdGlvbnM6IHtcblx0XHRcdHdoaXRlU3BhY2U6ICdjb2xsYXBzZScgLy8gZml4ZWRcblx0XHR9XG5cdH0sXG5cblx0Ly8gUU5hbWVcblx0e1xuXHRcdHZhcmlldHk6ICdwcmltaXRpdmUnLFxuXHRcdG5hbWU6ICd4czpRTmFtZScsXG5cdFx0cGFyZW50OiAneHM6YW55QXRvbWljVHlwZScsXG5cdFx0cmVzdHJpY3Rpb25zOiB7XG5cdFx0XHR3aGl0ZVNwYWNlOiAnY29sbGFwc2UnIC8vIGZpeGVkXG5cdFx0fVxuXHR9LFxuXG5cdC8vIE5PVEFUSU9OXG5cdHtcblx0XHR2YXJpZXR5OiAncHJpbWl0aXZlJyxcblx0XHRuYW1lOiAneHM6Tk9UQVRJT04nLFxuXHRcdHBhcmVudDogJ3hzOmFueUF0b21pY1R5cGUnLFxuXHRcdHJlc3RyaWN0aW9uczoge1xuXHRcdFx0d2hpdGVTcGFjZTogJ2NvbGxhcHNlJyAvLyBmaXhlZFxuXHRcdH1cblx0fSxcblxuXHQvLyBkYXRlVGltZVN0YW1wXG5cdHtcblx0XHR2YXJpZXR5OiAnZGVyaXZlZCcsXG5cdFx0bmFtZTogJ3hzOmRhdGVUaW1lU3RhbXAnLFxuXHRcdGJhc2U6ICd4czpkYXRlVGltZScsXG5cdFx0cmVzdHJpY3Rpb25zOiB7XG5cdFx0XHR3aGl0ZVNwYWNlOiAnY29sbGFwc2UnLCAvLyBmaXhlZFxuXHRcdFx0ZXhwbGljaXRUaW1lem9uZTogJ3JlcXVpcmVkJyAvLyBmaXhlZFxuXHRcdH1cblx0fSxcblxuXHQvLyBub3JtYWxpemVkU3RyaW5nXG5cdHtcblx0XHR2YXJpZXR5OiAnZGVyaXZlZCcsXG5cdFx0bmFtZTogJ3hzOm5vcm1hbGl6ZWRTdHJpbmcnLFxuXHRcdGJhc2U6ICd4czpzdHJpbmcnLFxuXHRcdHJlc3RyaWN0aW9uczoge1xuXHRcdFx0d2hpdGVTcGFjZTogJ3JlcGxhY2UnXG5cdFx0fVxuXHR9LFxuXG5cdC8vIHRva2VuXG5cdHtcblx0XHR2YXJpZXR5OiAnZGVyaXZlZCcsXG5cdFx0bmFtZTogJ3hzOnRva2VuJyxcblx0XHRiYXNlOiAneHM6bm9ybWFsaXplZFN0cmluZycsXG5cdFx0cmVzdHJpY3Rpb25zOiB7XG5cdFx0XHR3aGl0ZVNwYWNlOiAnY29sbGFwc2UnXG5cdFx0fVxuXHR9LFxuXG5cdC8vIGxhbmd1YWdlIChUT0RPOiBpbXBsZW1lbnQgcGF0dGVybilcblx0e1xuXHRcdHZhcmlldHk6ICdkZXJpdmVkJyxcblx0XHRuYW1lOiAneHM6bGFuZ3VhZ2UnLFxuXHRcdGJhc2U6ICd4czp0b2tlbicsXG5cdFx0cmVzdHJpY3Rpb25zOiB7XG5cdFx0XHR3aGl0ZVNwYWNlOiAnY29sbGFwc2UnXG5cdFx0fVxuXHR9LFxuXG5cdC8vIE5NVE9LRU4gKFRPRE86IGltcGxlbWVudCBwYXR0ZXJuKVxuXHR7XG5cdFx0dmFyaWV0eTogJ2Rlcml2ZWQnLFxuXHRcdG5hbWU6ICd4czpOTVRPS0VOJyxcblx0XHRiYXNlOiAneHM6dG9rZW4nLFxuXHRcdHJlc3RyaWN0aW9uczoge1xuXHRcdFx0d2hpdGVTcGFjZTogJ2NvbGxhcHNlJ1xuXHRcdH1cblx0fSxcblxuXHQvLyBOTVRPS0VOU1xuXHR7XG5cdFx0dmFyaWV0eTogJ2xpc3QnLFxuXHRcdG5hbWU6ICd4czpOTVRPS0VOUycsXG5cdFx0dHlwZTogJ05NVE9LRU4nLFxuXHRcdHJlc3RyaWN0aW9uczoge1xuXHRcdFx0bWluTGVuZ3RoOiAxLFxuXHRcdFx0d2hpdGVTcGFjZTogJ2NvbGxhcHNlJ1xuXHRcdH1cblx0fSxcblxuXHQvLyBOYW1lIChUT0RPOiBpbXBsZW1lbnQgcGF0dGVybilcblx0e1xuXHRcdHZhcmlldHk6ICdkZXJpdmVkJyxcblx0XHRuYW1lOiAneHM6TmFtZScsXG5cdFx0YmFzZTogJ3hzOnRva2VuJyxcblx0XHRyZXN0cmljdGlvbnM6IHtcblx0XHRcdHdoaXRlU3BhY2U6ICdjb2xsYXBzZSdcblx0XHR9XG5cdH0sXG5cblx0Ly8gTkNOYW1lIChUT0RPOiBpbXBsZW1lbnQgcGF0dGVybilcblx0e1xuXHRcdHZhcmlldHk6ICdkZXJpdmVkJyxcblx0XHRuYW1lOiAneHM6TkNOYW1lJyxcblx0XHRiYXNlOiAneHM6TmFtZScsXG5cdFx0cmVzdHJpY3Rpb25zOiB7XG5cdFx0XHR3aGl0ZVNwYWNlOiAnY29sbGFwc2UnXG5cdFx0fVxuXHR9LFxuXG5cdC8vIElEIChUT0RPOiBpbXBsZW1lbnQgcGF0dGVybilcblx0e1xuXHRcdHZhcmlldHk6ICdkZXJpdmVkJyxcblx0XHRuYW1lOiAneHM6SUQnLFxuXHRcdGJhc2U6ICd4czpOQ05hbWUnLFxuXHRcdHJlc3RyaWN0aW9uczoge1xuXHRcdFx0d2hpdGVTcGFjZTogJ2NvbGxhcHNlJ1xuXHRcdH1cblx0fSxcblxuXHQvLyBJRFJFRiAoVE9ETzogaW1wbGVtZW50IHBhdHRlcm4pXG5cdHtcblx0XHR2YXJpZXR5OiAnZGVyaXZlZCcsXG5cdFx0bmFtZTogJ3hzOklEUkVGJyxcblx0XHRiYXNlOiAneHM6TkNOYW1lJyxcblx0XHRyZXN0cmljdGlvbnM6IHtcblx0XHRcdHdoaXRlU3BhY2U6ICdjb2xsYXBzZSdcblx0XHR9XG5cdH0sXG5cblx0Ly8gSURSRUZTXG5cdHtcblx0XHR2YXJpZXR5OiAnbGlzdCcsXG5cdFx0bmFtZTogJ3hzOklEUkVGUycsXG5cdFx0dHlwZTogJ0lEUkVGJyxcblx0XHRyZXN0cmljdGlvbnM6IHtcblx0XHRcdG1pbkxlbmd0aDogMSxcblx0XHRcdHdoaXRlU3BhY2U6ICdjb2xsYXBzZSdcblx0XHR9XG5cdH0sXG5cblx0Ly8gRU5USVRZIChUT0RPOiBpbXBsZW1lbnQgcGF0dGVybilcblx0e1xuXHRcdHZhcmlldHk6ICdkZXJpdmVkJyxcblx0XHRuYW1lOiAneHM6RU5USVRZJyxcblx0XHRiYXNlOiAneHM6TkNOYW1lJyxcblx0XHRyZXN0cmljdGlvbnM6IHtcblx0XHRcdHdoaXRlU3BhY2U6ICdjb2xsYXBzZSdcblx0XHR9XG5cdH0sXG5cblx0Ly8gRU5USVRJRVNcblx0e1xuXHRcdHZhcmlldHk6ICdsaXN0Jyxcblx0XHRuYW1lOiAneHM6RU5USVRJRVMnLFxuXHRcdHR5cGU6ICdFTlRJVFknLFxuXHRcdHJlc3RyaWN0aW9uczoge1xuXHRcdFx0bWluTGVuZ3RoOiAxLFxuXHRcdFx0d2hpdGVTcGFjZTogJ2NvbGxhcHNlJ1xuXHRcdH1cblx0fSxcblxuXHQvLyBpbnRlZ2VyIChUT0RPOiBpbXBsZW1lbnQgcGF0dGVybilcblx0e1xuXHRcdHZhcmlldHk6ICdwcmltaXRpdmUnLFxuXHRcdG5hbWU6ICd4czppbnRlZ2VyJyxcblx0XHRwYXJlbnQ6ICd4czpkZWNpbWFsJyxcblx0XHRyZXN0cmljdGlvbnM6IHtcblx0XHRcdGZyYWN0aW9uRGlnaXRzOiAwLCAvLyBmaXhlZFxuXHRcdFx0d2hpdGVTcGFjZTogJ2NvbGxhcHNlJyAvLyBmaXhlZFxuXHRcdH1cblx0fSxcblxuXHQvLyBub25Qb3NpdGl2ZUludGVnZXIgKFRPRE86IGltcGxlbWVudCBwYXR0ZXJuKVxuXHR7XG5cdFx0dmFyaWV0eTogJ2Rlcml2ZWQnLFxuXHRcdG5hbWU6ICd4czpub25Qb3NpdGl2ZUludGVnZXInLFxuXHRcdGJhc2U6ICd4czppbnRlZ2VyJyxcblx0XHRyZXN0cmljdGlvbnM6IHtcblx0XHRcdGZyYWN0aW9uRGlnaXRzOiAwLCAvLyBmaXhlZFxuXHRcdFx0bWF4SW5jbHVzaXZlOiAnMCcsXG5cdFx0XHR3aGl0ZVNwYWNlOiAnY29sbGFwc2UnIC8vIGZpeGVkXG5cdFx0fVxuXHR9LFxuXG5cdC8vIG5lZ2F0aXZlSW50ZWdlciAoVE9ETzogaW1wbGVtZW50IHBhdHRlcm4pXG5cdHtcblx0XHR2YXJpZXR5OiAnZGVyaXZlZCcsXG5cdFx0bmFtZTogJ3hzOm5lZ2F0aXZlSW50ZWdlcicsXG5cdFx0YmFzZTogJ3hzOm5vblBvc2l0aXZlSW50ZWdlcicsXG5cdFx0cmVzdHJpY3Rpb25zOiB7XG5cdFx0XHRmcmFjdGlvbkRpZ2l0czogMCwgLy8gZml4ZWRcblx0XHRcdG1heEluY2x1c2l2ZTogJy0xJyxcblx0XHRcdHdoaXRlU3BhY2U6ICdjb2xsYXBzZScgLy8gZml4ZWRcblx0XHR9XG5cdH0sXG5cblx0Ly8gbG9uZyAoVE9ETzogaW1wbGVtZW50IHBhdHRlcm4pXG5cdHtcblx0XHR2YXJpZXR5OiAnZGVyaXZlZCcsXG5cdFx0bmFtZTogJ3hzOmxvbmcnLFxuXHRcdGJhc2U6ICd4czppbnRlZ2VyJyxcblx0XHRyZXN0cmljdGlvbnM6IHtcblx0XHRcdGZyYWN0aW9uRGlnaXRzOiAwLCAvLyBmaXhlZFxuXHRcdFx0bWF4SW5jbHVzaXZlOiAnOTIyMzM3MjAzNjg1NDc3NTgwNycsXG5cdFx0XHRtaW5JbmNsdXNpdmU6ICctOTIyMzM3MjAzNjg1NDc3NTgwOCcsXG5cdFx0XHR3aGl0ZVNwYWNlOiAnY29sbGFwc2UnIC8vIGZpeGVkXG5cdFx0fVxuXHR9LFxuXG5cdC8vIGludCAoVE9ETzogaW1wbGVtZW50IHBhdHRlcm4pXG5cdHtcblx0XHR2YXJpZXR5OiAnZGVyaXZlZCcsXG5cdFx0bmFtZTogJ3hzOmludCcsXG5cdFx0YmFzZTogJ3hzOmxvbmcnLFxuXHRcdHJlc3RyaWN0aW9uczoge1xuXHRcdFx0ZnJhY3Rpb25EaWdpdHM6IDAsIC8vIGZpeGVkXG5cdFx0XHRtYXhJbmNsdXNpdmU6ICcyMTQ3NDgzNjQ3Jyxcblx0XHRcdG1pbkluY2x1c2l2ZTogJy0yMTQ3NDgzNjQ4Jyxcblx0XHRcdHdoaXRlU3BhY2U6ICdjb2xsYXBzZScgLy8gZml4ZWRcblx0XHR9XG5cdH0sXG5cblx0Ly8gc2hvcnQgKFRPRE86IGltcGxlbWVudCBwYXR0ZXJuKVxuXHR7XG5cdFx0dmFyaWV0eTogJ2Rlcml2ZWQnLFxuXHRcdG5hbWU6ICd4czpzaG9ydCcsXG5cdFx0YmFzZTogJ3hzOmludCcsXG5cdFx0cmVzdHJpY3Rpb25zOiB7XG5cdFx0XHRmcmFjdGlvbkRpZ2l0czogMCwgLy8gZml4ZWRcblx0XHRcdG1heEluY2x1c2l2ZTogJzMyNzY3Jyxcblx0XHRcdG1pbkluY2x1c2l2ZTogJy0zMjc2OCcsXG5cdFx0XHR3aGl0ZVNwYWNlOiAnY29sbGFwc2UnIC8vIGZpeGVkXG5cdFx0fVxuXHR9LFxuXG5cdC8vIGJ5dGUgKFRPRE86IGltcGxlbWVudCBwYXR0ZXJuKVxuXHR7XG5cdFx0dmFyaWV0eTogJ2Rlcml2ZWQnLFxuXHRcdG5hbWU6ICd4czpieXRlJyxcblx0XHRiYXNlOiAneHM6c2hvcnQnLFxuXHRcdHJlc3RyaWN0aW9uczoge1xuXHRcdFx0ZnJhY3Rpb25EaWdpdHM6IDAsIC8vIGZpeGVkXG5cdFx0XHRtYXhJbmNsdXNpdmU6ICcxMjcnLFxuXHRcdFx0bWluSW5jbHVzaXZlOiAnLTEyOCcsXG5cdFx0XHR3aGl0ZVNwYWNlOiAnY29sbGFwc2UnIC8vIGZpeGVkXG5cdFx0fVxuXHR9LFxuXG5cdC8vIG5vbk5lZ2F0aXZlSW50ZWdlciAoVE9ETzogaW1wbGVtZW50IHBhdHRlcm4pXG5cdHtcblx0XHR2YXJpZXR5OiAnZGVyaXZlZCcsXG5cdFx0bmFtZTogJ3hzOm5vbk5lZ2F0aXZlSW50ZWdlcicsXG5cdFx0YmFzZTogJ3hzOmludGVnZXInLFxuXHRcdHJlc3RyaWN0aW9uczoge1xuXHRcdFx0ZnJhY3Rpb25EaWdpdHM6IDAsIC8vIGZpeGVkXG5cdFx0XHRtaW5JbmNsdXNpdmU6ICcwJyxcblx0XHRcdHdoaXRlU3BhY2U6ICdjb2xsYXBzZScgLy8gZml4ZWRcblx0XHR9XG5cdH0sXG5cblx0Ly8gdW5zaWduZWRMb25nIChUT0RPOiBpbXBsZW1lbnQgcGF0dGVybilcblx0e1xuXHRcdHZhcmlldHk6ICdkZXJpdmVkJyxcblx0XHRuYW1lOiAneHM6dW5zaWduZWRMb25nJyxcblx0XHRiYXNlOiAneHM6bm9uTmVnYXRpdmVJbnRlZ2VyJyxcblx0XHRyZXN0cmljdGlvbnM6IHtcblx0XHRcdGZyYWN0aW9uRGlnaXRzOiAwLCAvLyBmaXhlZFxuXHRcdFx0bWF4SW5jbHVzaXZlOiAnMTg0NDY3NDQwNzM3MDk1NTE2MTUnLFxuXHRcdFx0bWluSW5jbHVzaXZlOiAnMCcsXG5cdFx0XHR3aGl0ZVNwYWNlOiAnY29sbGFwc2UnIC8vIGZpeGVkXG5cdFx0fVxuXHR9LFxuXG5cdC8vIHVuc2lnbmVkSW50IChUT0RPOiBpbXBsZW1lbnQgcGF0dGVybilcblx0e1xuXHRcdHZhcmlldHk6ICdkZXJpdmVkJyxcblx0XHRuYW1lOiAneHM6dW5zaWduZWRJbnQnLFxuXHRcdGJhc2U6ICd4czp1bnNpZ25lZExvbmcnLFxuXHRcdHJlc3RyaWN0aW9uczoge1xuXHRcdFx0ZnJhY3Rpb25EaWdpdHM6IDAsIC8vIGZpeGVkXG5cdFx0XHRtYXhJbmNsdXNpdmU6ICc0Mjk0OTY3Mjk1Jyxcblx0XHRcdG1pbkluY2x1c2l2ZTogJzAnLFxuXHRcdFx0d2hpdGVTcGFjZTogJ2NvbGxhcHNlJyAvLyBmaXhlZFxuXHRcdH1cblx0fSxcblxuXHQvLyB1bnNpZ25lZFNob3J0IChUT0RPOiBpbXBsZW1lbnQgcGF0dGVybilcblx0e1xuXHRcdHZhcmlldHk6ICdkZXJpdmVkJyxcblx0XHRuYW1lOiAneHM6dW5zaWduZWRTaG9ydCcsXG5cdFx0YmFzZTogJ3hzOnVuc2lnbmVkSW50Jyxcblx0XHRyZXN0cmljdGlvbnM6IHtcblx0XHRcdGZyYWN0aW9uRGlnaXRzOiAwLCAvLyBmaXhlZFxuXHRcdFx0bWF4SW5jbHVzaXZlOiAnNjU1MzUnLFxuXHRcdFx0bWluSW5jbHVzaXZlOiAnMCcsXG5cdFx0XHR3aGl0ZVNwYWNlOiAnY29sbGFwc2UnIC8vIGZpeGVkXG5cdFx0fVxuXHR9LFxuXG5cdC8vIHVuc2lnbmVkQnl0ZSAoVE9ETzogaW1wbGVtZW50IHBhdHRlcm4pXG5cdHtcblx0XHR2YXJpZXR5OiAnZGVyaXZlZCcsXG5cdFx0bmFtZTogJ3hzOnVuc2lnbmVkQnl0ZScsXG5cdFx0YmFzZTogJ3hzOnVuc2lnbmVkU2hvcnQnLFxuXHRcdHJlc3RyaWN0aW9uczoge1xuXHRcdFx0ZnJhY3Rpb25EaWdpdHM6IDAsIC8vIGZpeGVkXG5cdFx0XHRtYXhJbmNsdXNpdmU6ICcyNTUnLFxuXHRcdFx0bWluSW5jbHVzaXZlOiAnMCcsXG5cdFx0XHR3aGl0ZVNwYWNlOiAnY29sbGFwc2UnIC8vIGZpeGVkXG5cdFx0fVxuXHR9LFxuXG5cdC8vIHBvc2l0aXZlSW50ZWdlciAoVE9ETzogaW1wbGVtZW50IHBhdHRlcm4pXG5cdHtcblx0XHR2YXJpZXR5OiAnZGVyaXZlZCcsXG5cdFx0bmFtZTogJ3hzOnBvc2l0aXZlSW50ZWdlcicsXG5cdFx0YmFzZTogJ3hzOm5vbk5lZ2F0aXZlSW50ZWdlcicsXG5cdFx0cmVzdHJpY3Rpb25zOiB7XG5cdFx0XHRmcmFjdGlvbkRpZ2l0czogMCwgLy8gZml4ZWRcblx0XHRcdG1pbkluY2x1c2l2ZTogJzEnLFxuXHRcdFx0d2hpdGVTcGFjZTogJ2NvbGxhcHNlJyAvLyBmaXhlZFxuXHRcdH1cblx0fSxcblxuXHQvLyB5ZWFyTW9udGhEdXJhdGlvbiAoVE9ETzogaW1wbGVtZW50IHBhdHRlcm4pXG5cdHtcblx0XHR2YXJpZXR5OiAnZGVyaXZlZCcsXG5cdFx0bmFtZTogJ3hzOnllYXJNb250aER1cmF0aW9uJyxcblx0XHRiYXNlOiAneHM6ZHVyYXRpb24nLFxuXHRcdHJlc3RyaWN0aW9uczoge1xuXHRcdFx0d2hpdGVTcGFjZTogJ2NvbGxhcHNlJyAvLyBmaXhlZFxuXHRcdH1cblx0fSxcblxuXHQvLyBkYXlUaW1lRHVyYXRpb24gKFRPRE86IGltcGxlbWVudCBwYXR0ZXJuKVxuXHR7XG5cdFx0dmFyaWV0eTogJ2Rlcml2ZWQnLFxuXHRcdG5hbWU6ICd4czpkYXlUaW1lRHVyYXRpb24nLFxuXHRcdGJhc2U6ICd4czpkdXJhdGlvbicsXG5cdFx0cmVzdHJpY3Rpb25zOiB7XG5cdFx0XHR3aGl0ZVNwYWNlOiAnY29sbGFwc2UnIC8vIGZpeGVkXG5cdFx0fVxuXHR9LFxuXG5cdHtcblx0XHR2YXJpZXR5OiAnZGVyaXZlZCcsXG5cdFx0bmFtZTogJ2Z1bmN0aW9uKCopJyxcblx0XHRiYXNlOiAnaXRlbSgpJ1xuXHR9LFxuXG5cdHtcblx0XHR2YXJpZXR5OiAndW5pb24nLFxuXHRcdG5hbWU6ICd4czplcnJvcicsXG5cdFx0bWVtYmVyVHlwZXM6IFtdXG5cdH0sXG5cblx0e1xuXHRcdHZhcmlldHk6ICdkZXJpdmVkJyxcblx0XHRuYW1lOiAnbWFwKCopJyxcblx0XHRiYXNlOiAnZnVuY3Rpb24oKiknXG5cdH0sXG5cblx0e1xuXHRcdHZhcmlldHk6ICdkZXJpdmVkJyxcblx0XHRuYW1lOiAnYXJyYXkoKiknLFxuXHRcdGJhc2U6ICdmdW5jdGlvbigqKSdcblx0fSxcblxuXHR7XG5cdFx0dmFyaWV0eTogJ3ByaW1pdGl2ZScsXG5cdFx0bmFtZTogJ25vZGUoKScsXG5cdFx0cGFyZW50OiAnaXRlbSgpJ1xuXHR9LFxuXG5cdHtcblx0XHR2YXJpZXR5OiAnZGVyaXZlZCcsXG5cdFx0bmFtZTogJ2VsZW1lbnQoKScsXG5cdFx0YmFzZTogJ25vZGUoKSdcblx0fSxcblxuXHR7XG5cdFx0dmFyaWV0eTogJ2Rlcml2ZWQnLFxuXHRcdG5hbWU6ICdjb21tZW50KCknLFxuXHRcdGJhc2U6ICdub2RlKCknXG5cdH0sXG5cblx0e1xuXHRcdHZhcmlldHk6ICdkZXJpdmVkJyxcblx0XHRuYW1lOiAnYXR0cmlidXRlKCknLFxuXHRcdGJhc2U6ICdub2RlKCknXG5cdH0sXG5cblx0e1xuXHRcdHZhcmlldHk6ICdkZXJpdmVkJyxcblx0XHRuYW1lOiAndGV4dCgpJyxcblx0XHRiYXNlOiAnbm9kZSgpJ1xuXHR9LFxuXG5cdHtcblx0XHR2YXJpZXR5OiAnZGVyaXZlZCcsXG5cdFx0bmFtZTogJ3Byb2Nlc3NpbmctaW5zdHJ1Y3Rpb24oKScsXG5cdFx0YmFzZTogJ25vZGUoKSdcblx0fSxcblxuXHR7XG5cdFx0dmFyaWV0eTogJ2Rlcml2ZWQnLFxuXHRcdG5hbWU6ICdkb2N1bWVudCgpJyxcblx0XHRiYXNlOiAnbm9kZSgpJ1xuXHR9LFxuXG5cdHtcblx0XHR2YXJpZXR5OiAndW5pb24nLFxuXHRcdG5hbWU6ICd4czpudW1lcmljJyxcblx0XHRtZW1iZXJUeXBlczogWyd4czpkZWNpbWFsJywgJ3hzOmludGVnZXInLCAneHM6ZmxvYXQnLCAneHM6ZG91YmxlJ11cblx0fVxuXTtcbiJdfQ==