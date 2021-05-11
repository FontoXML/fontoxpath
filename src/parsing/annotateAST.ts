import astHelper, { IAST } from './astHelper';
import {ValueType, valueTypeToString} from '../expressions/dataTypes/Value';


export default function annotateAst(ast: IAST): [IAST, ValueType] {
    ast = astHelper.followPath(astHelper.getFirstChild(ast, 'mainModule'), ['queryBody', '*']);
    let result: [IAST, ValueType] = annotate(ast)
    let annotatedAst: IAST = result[0]
    let finalType: ValueType = result[1]
    console.log(annotatedAst)
    return result
}



function annotate(ast: IAST): [IAST, ValueType]  {
    if(ast[0] == 'addOp') {
        let left: [IAST, ValueType] = annotate(ast[1] as IAST)
        let right: [IAST, ValueType] = annotate(ast[2] as IAST)
        if(left[1] === ValueType.XSINTEGER && right[1] === ValueType.XSINTEGER) {
            // console.log(ast)
            ast.push(["type", valueTypeToString(ValueType.XSINTEGER)])
            // console.log(ast)
            return [ast, ValueType.XSINTEGER]
        } else {
            throw new Error(
                'XPST0003: Use of XQuery functionality is not allowed in XPath context'
            );
        }
    } else if(ast[0] === 'firstOperand' || ast[0] === 'secondOperand') {
        let child: IAST = astHelper.getFirstChild(ast, "*")
        if(child[0] == 'integerConstantExpr') {
            ast.push(["type", valueTypeToString(ValueType.XSINTEGER)])
            return [ast, ValueType.XSINTEGER]
        }
    }

    return undefined
    



}