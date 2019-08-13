import * as chai from 'chai';
import { evaluateXPath, evaluateXPathToBoolean } from 'fontoxpath';
import evaluateXPathToNumber from 'fontoxpath/evaluateXPathToNumber';
import evaluateXPathToString from "fontoxpath/evaluateXPathToString";
import * as slimdom from 'slimdom';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('VariableDeclaration', () => {
    it('create a variable declaration', () => {
        chai.assert.isTrue(
            evaluateXPathToBoolean(
                `declare variable $x := 3;
                (: Return x from the module :)
                $x`,
                documentNode,
                undefined,
                {},
                { language: evaluateXPath.XQUERY_3_1_LANGUAGE })
           );
    });
    it('create a more complex variable declaration', () => {
        chai.assert.equal(
            evaluateXPathToNumber(
                `declare variable $x := 3+4;
                (: Return x from the module :)
                $x`,
                documentNode,
                undefined,
                {},
                { language: evaluateXPath.XQUERY_3_1_LANGUAGE }), 7);
    });

    it('create a more complex variable declaration using variables', () => {
        chai.assert.equal(
            evaluateXPathToNumber(
                `declare variable $x := 1;
                declare variable $y := $x + 1;
                (: Return x from the module :)
                $y`,
                documentNode,
                undefined,
                {},
                { language: evaluateXPath.XQUERY_3_1_LANGUAGE }), 2);
    });
    it('create a more complex variable declaration using variables', () => {
        chai.assert.equal(
            evaluateXPathToString(
                `declare variable $x := 'hello';
                (: Return x from the module :)
                $x`,
                documentNode,
                undefined,
                {},
                { language: evaluateXPath.XQUERY_3_1_LANGUAGE }), 'hello');
    });
});
