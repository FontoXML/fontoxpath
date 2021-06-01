import {
	SequenceMultiplicity,
	SequenceType,
	stringToSequenceMultiplicity,
	stringToValueType,
} from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';

// TODO: Annotation not yet implemented. The docs don't mention it so we don't know the return types.
export function annotateTypeSwitchOperator(
	ast: IAST,
	argumentType: SequenceType,
	caseClausesReturns: SequenceType[],
	defaultCaseReturn: SequenceType
): SequenceType {
	const caseClausesConditions = astHelper.getChildren(ast, 'typeswitchExprCaseClause');
	// Do the switch case to see what will be returned
	for (let i = 0; i < caseClausesReturns.length; i++) {
		// The typeswitch either contains a sequenceType with a single type or an 'or' statement
		if (caseClausesConditions[i][1][0] === 'sequenceType') {
			const result = checkComparison(
				caseClausesConditions[i][1],
				argumentType,
				caseClausesReturns[i]
			);
			if (!result) continue;
			else return result;
		} else if (caseClausesConditions[i][1][0] === 'sequenceTypeUnion') {
			for (let j = 1; j <= 2; j++) {
				const res = checkComparison(
					caseClausesConditions[i][1][j],
					argumentType,
					caseClausesReturns[i]
				);
				if (!res) continue;
				else return res;
			}
		}
	}
	return defaultCaseReturn;
}

function checkComparison(conditon, argumentType, returnType): SequenceType | undefined {
	if (stringToValueType(conditon[1][1]['prefix'] + ':' + conditon[1][2]) === argumentType.type) {
		if ((conditon as IAST[]).length === 2) {
			if (argumentType.mult === SequenceMultiplicity.EXACTLY_ONE) {
				return returnType;
			}
		} else {
			if (argumentType.mult === stringToSequenceMultiplicity(conditon[2][1])) {
				return returnType;
			}
		}
	}
	return undefined;
}
