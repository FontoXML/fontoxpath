xquery version "1.0" encoding "UTF-8";

(: This file was generated on Thu Mar 1, 2012 23:43 (UTC+01) by REx v5.14 which is Copyright (c) 1979-2012 by Gunther Rademacher <grd@gmx.net> :)
(: REx command line: XQDocComments.ebnf -xquery -tree :)

(:~
 : The parser that was generated for the XQDocComments grammar.
 :)
module namespace p="XQDocComments";
declare default function namespace "http://www.w3.org/2005/xpath-functions";

(:~
 : The codepoint to charclass mapping for 7 bit codepoints.
 :)
declare variable $p:MAP0 as xs:integer+ :=
(
  0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 3, 4, 3, 3, 3, 3,
  5, 6, 7, 3, 3, 3, 3, 3, 8, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 10, 3, 11, 12, 13, 3, 14, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9,
  9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 3, 3, 3, 3, 3, 3, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9,
  9, 9, 9, 9, 9, 9, 9, 3, 3, 3, 15, 3
);

(:~
 : The codepoint to charclass mapping for codepoints below the surrogate block.
 :)
declare variable $p:MAP1 as xs:integer+ :=
(
  54, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62,
  62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 133, 126, 149,
  165, 216, 221, 195, 200, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180,
  180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180,
  180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 1, 0, 0, 2, 0, 0, 16, 3, 4, 3, 3, 3, 3, 5, 6, 7, 3, 3, 3, 3, 3, 8, 9,
  9, 9, 9, 9, 9, 9, 9, 9, 9, 10, 3, 11, 12, 13, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 9, 9, 9, 9, 9, 9, 9, 9,
  9, 9, 9, 9, 9, 9, 9, 3, 3, 3, 15, 3, 14, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 3, 3, 3, 3, 3
);

(:~
 : The codepoint to charclass mapping for codepoints above the surrogate block.
 :)
declare variable $p:MAP2 as xs:integer+ :=
(
  57344, 65536, 65533, 1114111, 3, 3
);

(:~
 : The token-set-id to DFA-initial-state mapping.
 :)
declare variable $p:INITIAL as xs:integer+ :=
(
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 76, 13, 14, 15, 16
);

(:~
 : The DFA transition table.
 :)
declare variable $p:TRANSITION as xs:integer+ :=
(
  214, 214, 214, 214, 214, 214, 214, 214, 237, 155, 136, 143, 147, 232, 251, 213, 237, 139, 152, 159, 147, 232, 251,
  213, 214, 164, 163, 168, 250, 232, 251, 213, 214, 172, 176, 168, 250, 232, 251, 213, 214, 182, 186, 168, 250, 232,
  251, 213, 214, 164, 194, 269, 250, 200, 198, 213, 214, 164, 163, 168, 204, 210, 215, 214, 214, 164, 219, 226, 250,
  232, 230, 213, 236, 164, 163, 241, 250, 232, 251, 213, 214, 178, 163, 288, 266, 245, 148, 248, 214, 164, 163, 255,
  250, 232, 251, 213, 259, 164, 163, 168, 250, 232, 251, 213, 188, 190, 263, 273, 222, 232, 251, 213, 214, 206, 163,
  277, 250, 232, 251, 213, 214, 164, 163, 168, 250, 232, 281, 213, 237, 139, 152, 159, 285, 232, 251, 213, 307, 337,
  337, 337, 0, 0, 256, 337, 24, 243, 19, 337, 0, 1216, 0, 0, 288, 337, 337, 337, 0, 0, 275, 337, 24, 224, 160, 288, 0,
  0, 0, 256, 0, 24, 224, 160, 0, 352, 0, 352, 288, 352, 0, 0, 18, 256, 0, 384, 0, 256, 384, 384, 0, 0, 640, 0, 0, 256,
  288, 0, 0, 21, 0, 1216, 0, 1180, 24, 1180, 0, 512, 0, 0, 672, 256, 0, 24, 512, 24, 0, 0, 0, 0, 24, 288, 0, 20, 0, 0,
  1216, 480, 20, 24, 224, 160, 576, 1216, 0, 24, 24, 24, 97, 0, 0, 0, 337, 97, 24, 224, 160, 443, 416, 1181, 1181, 0, 0,
  0, 1216, 0, 24, 0, 24, 569, 544, 0, 608, 0, 608, 288, 0, 640, 0, 0, 1242, 0, 22, 224, 160, 640, 24, 224, 160, 0, 696,
  224, 672, 0, 1216, 448, 24, 337, 0, 1235, 0, 23, 224, 178
);

(:~
 : The DFA-state to expected-token-set mapping.
 :)
declare variable $p:EXPECTED as xs:integer+ :=
(
  4, 262144, 524288, 262656, 524800, 3072, 1081344, 1184, 2336, 3584, 541184, 12800, 541188, 1085448, 196704, 1146928,
  512, 32768, 32, 16384, 12288, 4104, 32776, 8, 131072, 32, 8192, 8, 8
);

(:~
 : The token-string table.
 :)
declare variable $p:TOKEN as xs:string+ :=
(
  "(0)",
  "END",
  "Tag",
  "CommentContents",
  "Char",
  "Trim",
  "ElementContentChar",
  "QuotAttrContentChar",
  "AposAttrContentChar",
  "S",
  "'""'",
  "''''",
  "'(:'",
  "'(:~'",
  "'/>'",
  "':)'",
  "'<'",
  "'</'",
  "'='",
  "'>'",
  "'@'"
);

(:~
 : Match next token in input string, starting at given index, using
 : the DFA entry state for the set of tokens that are expected in
 : the current context.
 :
 : @param $input the input string.
 : @param $begin the index where to start in input string.
 : @param $token-set the expected token set id.
 : @return a sequence of three: the token code of the result token,
 : with input string begin and end positions. If there is no valid
 : token, return the negative id of the DFA state that failed, along
 : with begin and end positions of the longest viable prefix.
 :)
declare function p:match($input as xs:string,
                         $begin as xs:integer,
                         $token-set as xs:integer) as xs:integer+
{
  let $result := $p:INITIAL[1 + $token-set]
  return p:transition($input,
                      $begin,
                      $begin,
                      $begin,
                      $result,
                      $result mod 32,
                      0)
};

(:~
 : The DFA state transition function. If we are in a valid DFA state, save
 : it's result annotation, consume one input codepoint, calculate the next
 : state, and use tail recursion to do the same again. Otherwise, return
 : any valid result or a negative DFA state id in case of an error.
 :
 : @param $input the input string.
 : @param $begin the begin index of the current token in the input string.
 : @param $current the index of the current position in the input string.
 : @param $end the end index of the result in the input string.
 : @param $result the result code.
 : @param $current-state the current DFA state.
 : @param $previous-state the  previous DFA state.
 : @return a sequence of three: the token code of the result token,
 : with input string begin and end positions. If there is no valid
 : token, return the negative id of the DFA state that failed, along
 : with begin and end positions of the longest viable prefix.
 :)
declare function p:transition($input as xs:string,
                              $begin as xs:integer,
                              $current as xs:integer,
                              $end as xs:integer,
                              $result as xs:integer,
                              $current-state as xs:integer,
                              $previous-state as xs:integer) as xs:integer+
{
  if ($current-state = 0) then
    let $result := $result idiv 32
    return
      if ($result != 0) then
      (
        $result mod 32 - 1,
        $begin,
        $end - $result idiv 32
      )
      else
      (
        - $previous-state,
        $begin,
        $current - 1
      )
  else
    let $c0 := (string-to-codepoints(substring($input, $current, 1)), 0)[1]
    let $c1 :=
      if ($c0 < 128) then
        $p:MAP0[1 + $c0]
      else if ($c0 < 55296) then
        let $c1 := $c0 idiv 16
        let $c2 := $c1 idiv 64
        return $p:MAP1[1 + $c0 mod 16 + $p:MAP1[1 + $c1 mod 64 + $p:MAP1[1 + $c2]]]
      else
        p:map2($c0, 1, 2)
    let $current := $current + 1
    let $i0 := 32 * $c1 + $current-state - 1
    let $i1 := $i0 idiv 4
    let $next-state := $p:TRANSITION[$i0 mod 4 + $p:TRANSITION[$i1 + 1] + 1]
    return
      if ($next-state > 31) then
        p:transition($input, $begin, $current, $current, $next-state, $next-state mod 32, $current-state)
      else
        p:transition($input, $begin, $current, $end, $result, $next-state, $current-state)
};

(:~
 : Recursively translate one 32-bit chunk of an expected token bitset
 : to the corresponding sequence of token strings.
 :
 : @param $result the result of previous recursion levels.
 : @param $chunk the 32-bit chunk of the expected token bitset.
 : @param $base-token-code the token code of bit 0 in the current chunk.
 : @return the set of token strings.
 :)
declare function p:token($result as xs:string*,
                         $chunk as xs:integer,
                         $base-token-code as xs:integer) as xs:string*
{
  if ($chunk = 0) then
    $result
  else
    p:token
    (
      ($result, if ($chunk mod 2 != 0) then $p:TOKEN[$base-token-code] else ()),
      if ($chunk < 0) then $chunk idiv 2 + 2147483648 else $chunk idiv 2,
      $base-token-code + 1
    )
};

(:~
 : Calculate expected token set for a given DFA state as a sequence
 : of strings.
 :
 : @param $state the DFA state.
 : @return the set of token strings
 :)
declare function p:expected-token-set($state as xs:integer) as xs:string*
{
  if ($state > 0) then
    for $t in 0 to 0
    let $i0 := $t * 29 + $state - 1
    return p:token((), $p:EXPECTED[$i0 + 1], $t * 32 + 1)
  else
    ()
};

(:~
 : Classify codepoint by doing a tail recursive binary search for a
 : matching codepoint range entry in MAP2, the codepoint to charclass
 : map for codepoints above the surrogate block.
 :
 : @param $c the codepoint.
 : @param $lo the binary search lower bound map index.
 : @param $hi the binary search upper bound map index.
 : @return the character class.
 :)
declare function p:map2($c as xs:integer, $lo as xs:integer, $hi as xs:integer) as xs:integer
{
  if ($lo > $hi) then
    0
  else
    let $m := ($hi + $lo) idiv 2
    return
      if ($p:MAP2[$m] > $c) then
        p:map2($c, $lo, $m - 1)
      else if ($p:MAP2[2 + $m] < $c) then
        p:map2($c, $m + 1, $hi)
      else
        $p:MAP2[4 + $m]
};

(:~
 : The index of the parser state for accessing the combined
 : (i.e. level > 1) lookahead code.
 :)
declare variable $p:lk := 1;

(:~
 : The index of the parser state for accessing the position in the
 : input string of the begin of the token that has been shifted.
 :)
declare variable $p:b0 := 2;

(:~
 : The index of the parser state for accessing the position in the
 : input string of the end of the token that has been shifted.
 :)
declare variable $p:e0 := 3;

(:~
 : The index of the parser state for accessing the code of the
 : level-1-lookahead token.
 :)
declare variable $p:l1 := 4;

(:~
 : The index of the parser state for accessing the position in the
 : input string of the begin of the level-1-lookahead token.
 :)
declare variable $p:b1 := 5;

(:~
 : The index of the parser state for accessing the position in the
 : input string of the end of the level-1-lookahead token.
 :)
declare variable $p:e1 := 6;

(:~
 : The index of the parser state for accessing the token code that
 : was expected when an error was found.
 :)
declare variable $p:error := 7;

(:~
 : The index of the parser state that points to the first entry
 : used for collecting action results.
 :)
declare variable $p:result := 8;

(:~
 : Create a textual error message from a parsing error.
 :
 : @param $input the input string.
 : @param $error the parsing error descriptor.
 : @return the error message.
 :)
declare function p:error-message($input as xs:string, $error as element(error)) as xs:string
{
  let $begin := xs:integer($error/@b)
  let $context := string-to-codepoints(substring($input, 1, $begin - 1))
  let $linefeeds := index-of($context, 10)
  let $line := count($linefeeds) + 1
  let $column := ($begin - $linefeeds[last()], $begin)[1]
  return
    if ($error/@o) then
      concat
      (
        "syntax error, found ", $p:TOKEN[$error/@o + 1], "&#10;",
        "while expecting ", $p:TOKEN[$error/@x + 1], "&#10;",
        "after scanning ", string($error/@e - $begin), " characters at line ",
        string($line), ", column ", string($column), "&#10;",
        "...", substring($input, $begin, 32), "..."
      )
    else
      let $expected := p:expected-token-set($error/@s)
      return
        concat
        (
          "lexical analysis failed&#10;",
          "while expecting ",
          "["[exists($expected[2])],
          string-join($expected, ", "),
          "]"[exists($expected[2])],
          "&#10;",
          "after scanning ", string($error/@e - $begin), " characters at line ",
          string($line), ", column ", string($column), "&#10;",
          "...", substring($input, $begin, 32), "..."
        )
};

(:~
 : Shift one token, i.e. compare lookahead token 1 with expected
 : token and in case of a match, shift lookahead tokens down such that
 : l1 becomes the current token, and higher lookahead tokens move down.
 : When lookahead token 1 does not match the expected token, raise an
 : error by saving the expected token code in the error field of the
 : parser state.
 :
 : @param $code the expected token.
 : @param $input the input string.
 : @param $state the parser state.
 : @return the updated parser state.
 :)
declare function p:shift($code as xs:integer, $input as xs:string, $state as item()+) as item()+
{
  if ($state[$p:error]) then
    $state
  else if ($state[$p:l1] = $code) then
  (
    subsequence($state, $p:l1, $p:e1 - $p:l1 + 1),
    0,
    $state[$p:e1],
    subsequence($state, $p:e1),
    if ($state[$p:e0] != $state[$p:b1]) then
      text {substring($input, $state[$p:e0], $state[$p:b1] - $state[$p:e0])}
    else
      (),
    let $name := $p:TOKEN[1 + $state[$p:l1]]
    let $content := substring($input, $state[$p:b1], $state[$p:e1] - $state[$p:b1])
    return
      if (starts-with($name, "'")) then
        element TOKEN {$content}
      else
        element {$name} {$content}
  )
  else
  (
    subsequence($state, 1, $p:error - 1),
    element error
    {
      attribute b {$state[$p:b1]},
      attribute e {$state[$p:e1]},
      if ($state[$p:l1] < 0) then
        attribute s {- $state[$p:l1]}
      else
        (attribute o {$state[$p:l1]}, attribute x {$code})
    },
    subsequence($state, $p:error + 1)
  )
};

(:~
 : Lookahead one token on level 1.
 :
 : @param $set the code of the DFA entry state for the set of valid tokens.
 : @param $input the input string.
 : @param $state the parser state.
 : @return the updated parser state.
 :)
declare function p:lookahead1($set as xs:integer, $input as xs:string, $state as item()+) as item()+
{
  if ($state[$p:l1] != 0) then
    $state
  else
    let $match := p:match($input, $state[$p:b1], $set)
    return
    (
      $match[1],
      subsequence($state, $p:lk + 1, $p:l1 - $p:lk - 1),
      $match,
      subsequence($state, $p:e1 + 1)
    )
};

(:~
 : Reduce the result stack. Pop $count element, wrap them in a
 : new element named $name, and push the new element.
 :
 : @param $state the parser state.
 : @param $name the name of the result node.
 : @param $count the number of child nodes.
 : @return the updated parser state.
 :)
declare function p:reduce($state as item()+, $name as xs:string, $count as xs:integer) as item()+
{
  subsequence($state, 1, $count),
  element {$name}
  {
    subsequence($state, $count + 1)
  }
};

(:~
 : Parse TaggedContents.
 :
 : @param $input the input string.
 : @param $state the parser state.
 : @return the updated parser state.
 :)
declare function p:parse-TaggedContents($input as xs:string, $state as item()+) as item()+
{
  let $count := count($state)
  let $state := p:shift(20, $input, $state)                 (: '@' :)
  let $state := p:lookahead1(0, $input, $state)             (: Tag :)
  let $state := p:shift(2, $input, $state)                  (: Tag :)
  let $state := p:parse-Contents($input, $state)
  return p:reduce($state, "TaggedContents", $count)
};

(:~
 : Parse the 1st loop of production DirAttributeValue (zero or more). Use
 : tail recursion for iteratively updating the parser state.
 :
 : @param $input the input string.
 : @param $state the parser state.
 : @return the updated parser state.
 :)
declare function p:parse-DirAttributeValue-1($input as xs:string, $state as item()+) as item()+
{
  if ($state[$p:error]) then
    $state
  else
    let $state := p:lookahead1(7, $input, $state)           (: Trim | QuotAttrContentChar | '"' :)
    return
      if ($state[$p:l1] = 10) then                          (: '"' :)
        $state
      else
        let $state :=
          if ($state[$p:l1] = 7) then                       (: QuotAttrContentChar :)
            let $state := p:shift(7, $input, $state)        (: QuotAttrContentChar :)
            return $state
          else if ($state[$p:error]) then
            $state
          else
            let $state := p:shift(5, $input, $state)        (: Trim :)
            return $state
        return p:parse-DirAttributeValue-1($input, $state)
};

(:~
 : Parse the 2nd loop of production DirAttributeValue (zero or more). Use
 : tail recursion for iteratively updating the parser state.
 :
 : @param $input the input string.
 : @param $state the parser state.
 : @return the updated parser state.
 :)
declare function p:parse-DirAttributeValue-2($input as xs:string, $state as item()+) as item()+
{
  if ($state[$p:error]) then
    $state
  else
    let $state := p:lookahead1(8, $input, $state)           (: Trim | AposAttrContentChar | "'" :)
    return
      if ($state[$p:l1] = 11) then                          (: "'" :)
        $state
      else
        let $state :=
          if ($state[$p:l1] = 8) then                       (: AposAttrContentChar :)
            let $state := p:shift(8, $input, $state)        (: AposAttrContentChar :)
            return $state
          else if ($state[$p:error]) then
            $state
          else
            let $state := p:shift(5, $input, $state)        (: Trim :)
            return $state
        return p:parse-DirAttributeValue-2($input, $state)
};

(:~
 : Parse DirAttributeValue.
 :
 : @param $input the input string.
 : @param $state the parser state.
 : @return the updated parser state.
 :)
declare function p:parse-DirAttributeValue($input as xs:string, $state as item()+) as item()+
{
  let $count := count($state)
  let $state := p:lookahead1(5, $input, $state)             (: '"' | "'" :)
  let $state :=
    if ($state[$p:l1] = 10) then                            (: '"' :)
      let $state := p:shift(10, $input, $state)             (: '"' :)
      let $state := p:parse-DirAttributeValue-1($input, $state)
      let $state := p:shift(10, $input, $state)             (: '"' :)
      return $state
    else if ($state[$p:error]) then
      $state
    else
      let $state := p:shift(11, $input, $state)             (: "'" :)
      let $state := p:parse-DirAttributeValue-2($input, $state)
      let $state := p:shift(11, $input, $state)             (: "'" :)
      return $state
  return p:reduce($state, "DirAttributeValue", $count)
};

(:~
 : Parse DirAttrConstructor.
 :
 : @param $input the input string.
 : @param $state the parser state.
 : @return the updated parser state.
 :)
declare function p:parse-DirAttrConstructor($input as xs:string, $state as item()+) as item()+
{
  let $count := count($state)
  let $state := p:shift(2, $input, $state)                  (: Tag :)
  let $state := p:lookahead1(3, $input, $state)             (: S | '=' :)
  let $state :=
    if ($state[$p:error]) then
      $state
    else if ($state[$p:l1] = 9) then                        (: S :)
      let $state := p:shift(9, $input, $state)              (: S :)
      return $state
    else
      $state
  let $state := p:lookahead1(1, $input, $state)             (: '=' :)
  let $state := p:shift(18, $input, $state)                 (: '=' :)
  let $state := p:lookahead1(9, $input, $state)             (: S | '"' | "'" :)
  let $state :=
    if ($state[$p:error]) then
      $state
    else if ($state[$p:l1] = 9) then                        (: S :)
      let $state := p:shift(9, $input, $state)              (: S :)
      return $state
    else
      $state
  let $state := p:parse-DirAttributeValue($input, $state)
  return p:reduce($state, "DirAttrConstructor", $count)
};

(:~
 : Parse the 1st loop of production DirElemConstructor (zero or more). Use
 : tail recursion for iteratively updating the parser state.
 :
 : @param $input the input string.
 : @param $state the parser state.
 : @return the updated parser state.
 :)
declare function p:parse-DirElemConstructor-1($input as xs:string, $state as item()+) as item()+
{
  if ($state[$p:error]) then
    $state
  else
    let $state := p:lookahead1(10, $input, $state)          (: S | '/>' | '>' :)
    return
      if ($state[$p:l1] != 9) then                          (: S :)
        $state
      else
        let $state := p:shift(9, $input, $state)            (: S :)
        let $state := p:lookahead1(12, $input, $state)      (: Tag | S | '/>' | '>' :)
        let $state :=
          if ($state[$p:error]) then
            $state
          else if ($state[$p:l1] = 2) then                  (: Tag :)
            let $state := p:parse-DirAttrConstructor($input, $state)
            return $state
          else
            $state
        return p:parse-DirElemConstructor-1($input, $state)
};

(:~
 : Parse the 2nd loop of production DirElemConstructor (zero or more). Use
 : tail recursion for iteratively updating the parser state.
 :
 : @param $input the input string.
 : @param $state the parser state.
 : @return the updated parser state.
 :)
declare function p:parse-DirElemConstructor-2($input as xs:string, $state as item()+) as item()+
{
  if ($state[$p:error]) then
    $state
  else
    let $state := p:lookahead1(14, $input, $state)          (: Trim | ElementContentChar | '<' | '</' :)
    return
      if ($state[$p:l1] = 17) then                          (: '</' :)
        $state
      else
        let $state :=
          if ($state[$p:l1] = 16) then                      (: '<' :)
            let $state := p:parse-DirElemConstructor($input, $state)
            return $state
          else if ($state[$p:l1] = 6) then                  (: ElementContentChar :)
            let $state := p:shift(6, $input, $state)        (: ElementContentChar :)
            return $state
          else if ($state[$p:error]) then
            $state
          else
            let $state := p:shift(5, $input, $state)        (: Trim :)
            return $state
        return p:parse-DirElemConstructor-2($input, $state)
};

(:~
 : Parse DirElemConstructor.
 :
 : @param $input the input string.
 : @param $state the parser state.
 : @return the updated parser state.
 :)
declare function p:parse-DirElemConstructor($input as xs:string, $state as item()+) as item()+
{
  let $count := count($state)
  let $state := p:shift(16, $input, $state)                 (: '<' :)
  let $state := p:lookahead1(0, $input, $state)             (: Tag :)
  let $state := p:shift(2, $input, $state)                  (: Tag :)
  let $state := p:parse-DirElemConstructor-1($input, $state)
  let $state :=
    if ($state[$p:l1] = 14) then                            (: '/>' :)
      let $state := p:shift(14, $input, $state)             (: '/>' :)
      return $state
    else if ($state[$p:error]) then
      $state
    else
      let $state := p:shift(19, $input, $state)             (: '>' :)
      let $state := p:parse-DirElemConstructor-2($input, $state)
      let $state := p:shift(17, $input, $state)             (: '</' :)
      let $state := p:lookahead1(0, $input, $state)         (: Tag :)
      let $state := p:shift(2, $input, $state)              (: Tag :)
      let $state := p:lookahead1(4, $input, $state)         (: S | '>' :)
      let $state :=
        if ($state[$p:error]) then
          $state
        else if ($state[$p:l1] = 9) then                    (: S :)
          let $state := p:shift(9, $input, $state)          (: S :)
          return $state
        else
          $state
      let $state := p:lookahead1(2, $input, $state)         (: '>' :)
      let $state := p:shift(19, $input, $state)             (: '>' :)
      return $state
  return p:reduce($state, "DirElemConstructor", $count)
};

(:~
 : Parse the 1st loop of production Contents (zero or more). Use
 : tail recursion for iteratively updating the parser state.
 :
 : @param $input the input string.
 : @param $state the parser state.
 : @return the updated parser state.
 :)
declare function p:parse-Contents-1($input as xs:string, $state as item()+) as item()+
{
  if ($state[$p:error]) then
    $state
  else
    let $state := p:lookahead1(15, $input, $state)          (: Char | Trim | (':' ')') | '<' | '@' :)
    return
      if ($state[$p:l1] = 15                                (: (':' ')') :)
       or $state[$p:l1] = 20) then                          (: '@' :)
        $state
      else
        let $state :=
          if ($state[$p:l1] = 4) then                       (: Char :)
            let $state := p:shift(4, $input, $state)        (: Char :)
            return $state
          else if ($state[$p:l1] = 5) then                  (: Trim :)
            let $state := p:shift(5, $input, $state)        (: Trim :)
            return $state
          else if ($state[$p:error]) then
            $state
          else
            let $state := p:parse-DirElemConstructor($input, $state)
            return $state
        return p:parse-Contents-1($input, $state)
};

(:~
 : Parse Contents.
 :
 : @param $input the input string.
 : @param $state the parser state.
 : @return the updated parser state.
 :)
declare function p:parse-Contents($input as xs:string, $state as item()+) as item()+
{
  let $count := count($state)
  let $state := p:parse-Contents-1($input, $state)
  return p:reduce($state, "Contents", $count)
};

(:~
 : Parse the 1st loop of production XQDocComment (zero or more). Use
 : tail recursion for iteratively updating the parser state.
 :
 : @param $input the input string.
 : @param $state the parser state.
 : @return the updated parser state.
 :)
declare function p:parse-XQDocComment-1($input as xs:string, $state as item()+) as item()+
{
  if ($state[$p:error]) then
    $state
  else
    let $state := p:lookahead1(6, $input, $state)           (: (':' ')') | '@' :)
    return
      if ($state[$p:l1] != 20) then                         (: '@' :)
        $state
      else
        let $state := p:parse-TaggedContents($input, $state)
        return p:parse-XQDocComment-1($input, $state)
};

(:~
 : Parse XQDocComment.
 :
 : @param $input the input string.
 : @param $state the parser state.
 : @return the updated parser state.
 :)
declare function p:parse-XQDocComment($input as xs:string, $state as item()+) as item()+
{
  let $count := count($state)
  let $state := p:shift(13, $input, $state)                 (: ('(' ':~') :)
  let $state := p:parse-Contents($input, $state)
  let $state := p:parse-XQDocComment-1($input, $state)
  let $state := p:shift(15, $input, $state)                 (: (':' ')') :)
  return p:reduce($state, "XQDocComment", $count)
};

(:~
 : Parse the 1st loop of production Comment (zero or more). Use
 : tail recursion for iteratively updating the parser state.
 :
 : @param $input the input string.
 : @param $state the parser state.
 : @return the updated parser state.
 :)
declare function p:parse-Comment-1($input as xs:string, $state as item()+) as item()+
{
  if ($state[$p:error]) then
    $state
  else
    let $state := p:lookahead1(13, $input, $state)          (: CommentContents | ('(' ':') | (':' ')') | '@' :)
    return
      if ($state[$p:l1] = 15) then                          (: (':' ')') :)
        $state
      else
        let $state :=
          if ($state[$p:l1] = 3) then                       (: CommentContents :)
            let $state := p:shift(3, $input, $state)        (: CommentContents :)
            return $state
          else if ($state[$p:l1] = 12) then                 (: ('(' ':') :)
            let $state := p:parse-Comment($input, $state)
            return $state
          else if ($state[$p:error]) then
            $state
          else
            let $state := p:shift(20, $input, $state)       (: '@' :)
            return $state
        return p:parse-Comment-1($input, $state)
};

(:~
 : Parse Comment.
 :
 : @param $input the input string.
 : @param $state the parser state.
 : @return the updated parser state.
 :)
declare function p:parse-Comment($input as xs:string, $state as item()+) as item()+
{
  let $count := count($state)
  let $state := p:shift(12, $input, $state)                 (: ('(' ':') :)
  let $state := p:parse-Comment-1($input, $state)
  let $state := p:shift(15, $input, $state)                 (: (':' ')') :)
  return p:reduce($state, "Comment", $count)
};

(:~
 : Parse the 1st loop of production Comments (zero or more). Use
 : tail recursion for iteratively updating the parser state.
 :
 : @param $input the input string.
 : @param $state the parser state.
 : @return the updated parser state.
 :)
declare function p:parse-Comments-1($input as xs:string, $state as item()+) as item()+
{
  if ($state[$p:error]) then
    $state
  else
    let $state := p:lookahead1(11, $input, $state)          (: END | S | ('(' ':') | ('(' ':~') :)
    return
      if ($state[$p:l1] = 1) then                           (: END :)
        $state
      else
        let $state :=
          if ($state[$p:l1] = 9) then                       (: S :)
            let $state := p:shift(9, $input, $state)        (: S :)
            return $state
          else if ($state[$p:l1] = 12) then                 (: ('(' ':') :)
            let $state := p:parse-Comment($input, $state)
            return $state
          else if ($state[$p:error]) then
            $state
          else
            let $state := p:parse-XQDocComment($input, $state)
            return $state
        return p:parse-Comments-1($input, $state)
};

(:~
 : Parse Comments.
 :
 : @param $input the input string.
 : @param $state the parser state.
 : @return the updated parser state.
 :)
declare function p:parse-Comments($input as xs:string, $state as item()+) as item()+
{
  let $count := count($state)
  let $state := p:parse-Comments-1($input, $state)
  return p:reduce($state, "Comments", $count)
};

(:~
 : Parse start symbol Comments from given string.
 :
 : @param $s the string to be parsed.
 : @return the result as generated by parser actions.
 :)
declare function p:parse-Comments($s as xs:string) as item()*
{
  let $state := p:parse-Comments($s, (0, 1, 1, 0, 1, 0, false()))
  let $error := $state[$p:error]
  return
    if ($error) then
      element ERROR {$error/@*, p:error-message($s, $error)}
    else
      subsequence($state, $p:result)
};

(: End :)
