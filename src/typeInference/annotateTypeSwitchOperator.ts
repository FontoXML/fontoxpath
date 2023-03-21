import {
	SequenceMultiplicity,
	SequenceType,
	stringToSequenceMultiplicity,
	stringToValueType,
	ValueType,
} from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';

/**
 * Checks the type from the argument against all the different cases and if one matches, the return type of that case is returned.
 * If no types match, the default type is returned.
 *
 * @param ast the AST to be annotated.
 * @param argumentType the type of the input.
 * @param caseClausesReturns the different return types from the cases.
 * @param defaultCaseReturn the return type of the default case.
 * @returns the return type of the case that matched.
 */
export function annotateTypeSwitchOperator(
	ast: IAST,
	argumentType: SequenceType,
	caseClausesReturns: SequenceType[],
	defaultCaseReturn: SequenceType
): SequenceType | undefined {
	// TODO: check this case in more detail (anyKindTest for example returns undefined)
	if (!argumentType || caseClausesReturns.includes(undefined)) {
		return {
			type: ValueType.ITEM,
			mult: SequenceMultiplicity.ZERO_OR_MORE,
		};
	}
	// Get the types of the conditions from the clauses
	const caseClausesConditions = astHelper.getChildren(ast, 'typeswitchExprCaseClause');
	// Do the switch case to see what will be returned
	for (let i = 0; i < caseClausesReturns.length; i++) {
		// The typeswitch either contains a sequenceType with a single type or an 'or' statement (sequenceTypeUnion)
		const condition: IAST = astHelper.getFirstChild(caseClausesConditions[i], '*');
		// Check if we have a sequenceType or a sequenceTypeUnion
		switch (condition[0]) {
			case 'sequenceType':
				// Check if the type of the argument matches the type of the condition
				const result = checkComparison(condition, argumentType, caseClausesReturns[i]);
				// If the types did not match, check the next case, if they matched, return the type
				if (!result) continue;
				else {
					if (result.type !== ValueType.ITEM) {
						astHelper.insertAttribute(ast, 'type', result);
					}
					return result;
				}
			case 'sequenceTypeUnion':
				// Get both SequenceTypes of the SequenceTypeUnion and iterate over them
				const operands = astHelper.getChildren(condition, '*');
				for (let j = 0; j < 2; j++) {
					// Check if the type of the argument matches the type of the condition
					const res = checkComparison(operands[j], argumentType, caseClausesReturns[i]);
					// If the types did not match, check the next case, if they matched, return the type
					if (!res) continue;
					else {
						if (res.type !== ValueType.ITEM) {
							astHelper.insertAttribute(ast, 'type', res);
						}
						return res;
					}
				}
			// This should never be reached
			default:
				return {
					type: ValueType.ITEM,
					mult: SequenceMultiplicity.ZERO_OR_MORE,
				};
		}
	}
	// Return the type from the default case
	if (defaultCaseReturn.type !== ValueType.ITEM) {
		astHelper.insertAttribute(ast, 'type', defaultCaseReturn);
	}
	return defaultCaseReturn;
}

/**
 * Check if the type of the argument matches the type of the condition.
 *
 * @param condition the condition we check against.
 * @param argumentType the argument type we compare with the condition.
 * @param returnType the type that is returned if the condition matches with the argumentType.
 * @returns undefined if the types don't match or the returnType if they match.
 */
function checkComparison(
	condition: IAST,
	argumentType: SequenceType,
	returnType: SequenceType
): SequenceType | undefined {
	// Get the children of the SequenceType which contains an atomicType and an optional occurrenceIndicator
	const children = astHelper.getChildren(condition, '*');
	const firstChild = astHelper.getFirstChild(condition, 'atomicType');
	// TODO: check this behaviours here as well (happens together with the TODO above)
	// If there is no atomicType, we cannot compare the types and hence cannot infer the type and return item()*
	if (!firstChild) {
		return {
			type: ValueType.ITEM,
			mult: SequenceMultiplicity.ZERO_OR_MORE,
		};
	}
	// Since the type in the atomicType is stored as a string, we need to fetch the data and compare it against our argumentType
	if (
		stringToValueType(astHelper.getAttribute(firstChild, 'prefix') + ':' + firstChild[2]) ===
		argumentType.type
	) {
		// If we have no occurrenceIndicator, the type is EXACTLY_ONE and we check against that one
		if (children.length === 1) {
			// If it matches, we return the returnType
			if (argumentType.mult === SequenceMultiplicity.EXACTLY_ONE) {
				return returnType;
			}
			// If we have an occurrenceIndicator, we check if the type and the occurrence match
		} else {
			const multiplicity = astHelper.getFirstChild(
				condition,
				'occurrenceIndicator'
			)[1] as string;
			// If they match, return the returnType
			if (argumentType.mult === stringToSequenceMultiplicity(multiplicity)) {
				return returnType;
			}
		}
	}
	// If the argumentType and the condition don't match, return undefined
	return undefined;
}
