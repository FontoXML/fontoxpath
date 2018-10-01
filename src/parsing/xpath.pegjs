{
function parseCodePoint (codePoint) {
    // TODO: Assert not in XPath mode
	if ((codePoint >= 0x1 && codePoint <= 0xD7FF) ||
		(codePoint >= 0xE000 && codePoint <= 0xFFFD) ||
		(codePoint >= 0x10000 && codePoint <= 0x10FFFF)) {
        return String.fromCodePoint(codePoint);
	}
	throw new Error(`XQST0090: The character reference ${codePoint} (${codePoint.toString(16)}) does not reference a valid codePoint.`);
}
}

// 1
Module
 = _ versionDecl:VersionDeclaration? _ module:(LibraryModule / MainModule) {return ["module", versionDecl, ["module", module]]}

// 2
VersionDeclaration
 = "xquery" _ versionAndEncoding:(
    ("encoding" S e:StringLiteral {return ["encoding", e]})
    / ("version" S version:StringLiteral encoding:(S "encoding" S e:StringLiteral {return e})? {return [["version", version], ["encoding", encoding]]})
) Separator {return ["versionDecl"].concat(versionAndEncoding)}

// 3

// 7
Separator = ";"

 // 222
StringLiteral
 = ('"' lit:(PredefinedEntityRef / CharRef / EscapeQuot / [^"&])* '"' {return lit.join('')})
 / ("'" lit:(PredefinedEntityRef / CharRef / EscapeApos / [^'&])* "'" {return lit.join('')})

// 233
CharRef
 = ("&#x" codePoint:([0-9a-fA-F]+) ";") {return parseCodePoint(parseInt(charref, 16))}
 / ("&#" codePoint:([0-9]+) ";") {return parseCodePoint(parseInt(charref, 10))}

// 225 TODO: Not in XPath mode
PredefinedEntityRef
 = "&" c:(
    "lt" {return "<"}
    / "gt" {return ">"}
    / "amp" {return "&"}
    / "quot" {return "&"}
    / "apos" {return "\'"}) ";" {return c}

// 226
EscapeQuot
 = "\"\"" {return "\""}

// 227
EscapeApos
 = "''" {return "'"}

LibraryModule
 = "lib" {return 'lib'}

MainModule
 = "main" {return 'main'}

// Whitespace Note: https://www.w3.org/TR/REC-xml/#NT-S
_
 = WhitespaceCharacter*

S
 = WhitespaceCharacter+

ExplicitWhitespace
 = ("\u0020" / "\u0009" / "\u000D" / "\u000A")+

WhitespaceCharacter
 = "\u0020" / "\u0009" / "\u000D" / "\u000A"
// / Comment // Note: comments can occur anywhere where whitespace is allowed: https://www.w3.org/TR/xpath-3/#DefaultWhitespaceHandling