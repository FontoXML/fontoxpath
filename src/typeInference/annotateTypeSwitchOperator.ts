import {
	SequenceMultiplicity,
	SequenceType,
	stringToSequenceMultiplicity,
	stringToValueType,
	ValueType,
} from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';

export function annotateTypeSwitchOperator(
	ast: IAST,
	argumentType: SequenceType,
	caseClausesReturns: SequenceType[],
	defaultCaseReturn: SequenceType
): SequenceType | undefined {
	// TODO: check this case in more detail (anyKindTest for example returns undefined)
	if (!argumentType || caseClausesReturns.includes(undefined)) {
		return undefined;
	}
	const caseClausesConditions = astHelper.getChildren(ast, 'typeswitchExprCaseClause');
	// Do the switch case to see what will be returned
	for (let i = 0; i < caseClausesReturns.length; i++) {
		// The typeswitch either contains a sequenceType with a single type or an 'or' statement (sequenceTypeUnion)
		const condition: IAST = astHelper.getFirstChild(caseClausesConditions[i], '*');
		switch (condition[0]) {
			case 'sequenceType':
				const result = checkComparison(condition, argumentType, caseClausesReturns[i]);
				if (!result) continue;
				else {
					astHelper.insertAttribute(ast, 'type', result);
					return result;
				}
			case 'sequenceTypeUnion':
				const operands = astHelper.getChildren(condition, '*');
				for (let j = 0; j < 2; j++) {
					const res = checkComparison(operands[j], argumentType, caseClausesReturns[i]);
					if (!res) continue;
					else {
						astHelper.insertAttribute(ast, 'type', res);
						return res;
					}
				}
			// This should never be reached
			default:
				return undefined;
		}
	}
	astHelper.insertAttribute(ast, 'type', defaultCaseReturn);
	return defaultCaseReturn;
}

function checkComparison(
	condition: IAST,
	argumentType: SequenceType,
	returnType: SequenceType
): SequenceType | undefined {
	const children = astHelper.getChildren(condition, '*');
	const firstChild = astHelper.getFirstChild(condition, 'atomicType');
	// TODO: check this behaviours here as well (happens together with the TODO above)
	if (!firstChild) {
		const itemReturn = {
			type: ValueType.ITEM,
			mult: SequenceMultiplicity.EXACTLY_ONE,
		};
		return itemReturn;
	}
	if (
		stringToValueType(astHelper.getAttribute(firstChild, 'prefix') + ':' + firstChild[2]) ===
		argumentType.type
	) {
		if (children.length === 1) {
			if (argumentType.mult === SequenceMultiplicity.EXACTLY_ONE) {
				return returnType;
			}
		} else {
			const multiplicity = astHelper.getFirstChild(
				condition,
				'occurrenceIndicator'
			)[1] as string;
			if (argumentType.mult === stringToSequenceMultiplicity(multiplicity)) {
				return returnType;
			}
		}
	}
	return undefined;
}
