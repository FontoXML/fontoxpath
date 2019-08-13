import * as chai from 'chai';
import { evaluateXPath, evaluateXPathToBoolean } from 'fontoxpath';
import * as slimdom from 'slimdom';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('VariableDeclaration', () => {
    it.only('create a variable declaration', () => {
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
});
