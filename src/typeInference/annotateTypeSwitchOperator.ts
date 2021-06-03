import {
	SequenceMultiplicity,
	SequenceType,
	stringToSequenceMultiplicity,
	stringToValueType,
} from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';

export function annotateTypeSwitchOperator(
	ast: IAST,
	argumentType: SequenceType,
	caseClausesReturns: SequenceType[],
	defaultCaseReturn: SequenceType
): SequenceType | undefined {
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
	const firstChild = astHelper.getFirstChild(condition, '*');
	if (
		stringToValueType(astHelper.getAttribute(firstChild, 'prefix') + ':' + firstChild[2]) ===
		argumentType.type
	) {
		if (condition.length === 2) {
			if (argumentType.mult === SequenceMultiplicity.EXACTLY_ONE) {
				return returnType;
			}
		} else {
			// TODO: verify if this behaviour is correct
			if (
				argumentType.mult ===
				stringToSequenceMultiplicity(
					astHelper.getFirstChild(condition, 'occurrenceIndicator')[0]
				)
			) {
				return returnType;
			}
		}
	}
	return undefined;
}
