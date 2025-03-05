import * as game from './game';

const
    load_xq =
`
declare namespace svg="http://www.w3.org/2000/svg";
declare namespace xlink="http://www.w3.org/1999/xlink";
declare namespace chain="http://mansoft.nl/chain";

declare variable $leveldoc external;

declare function local:process-field($row, $column, $field ) {
  let $x := ($column - 1) * 10 + 1
      , $y := ($row  - 1) * 10 + 1
  return
    if (empty($field)) then
      <use xmlns="http://www.w3.org/2000/svg" xlink:href="#empty" x="{$x}" y="{$y}"/>
    else
      <use xmlns="http://www.w3.org/2000/svg" xlink:href="{concat('#', $field/@shape)}" x="{$x}" y="{$y}" fill="{$field/@color}" color="{if ($field/@state = 'current') then 'black' else if ($field/@state = 'visited') then 'white' else $field/@color}" chain:row="{$row}" chain:column="{$column}"/>
};

declare %updating function local:load-svg($leveldoc, $svg) {
    let $chainreaction := $leveldoc
        , $chain-field := $chainreaction/chain:field
        , $columns := xs:integer($chainreaction/@columns)
        , $rows := xs:integer($chainreaction/@rows)
    return
    (
        replace value of node $svg/@viewBox with concat("0 0 ", $columns * 10 + 2, " ", $rows * 10 + 2),
        (
        for $row in 1 to $rows, $column in 1 to $columns
            let
                $field := $chain-field[xs:integer(@row) = $row][xs:integer(@column) = $column]
                , $use := local:process-field($row, $column, $field)
            return insert node $use as last into $svg
        )
    )
};

local:load-svg($leveldoc, .)
`
    , click_xq = 
`
declare namespace svg="http://www.w3.org/2000/svg";
declare namespace chain="http://mansoft.nl/chain";

declare variable $leveldoc external;
declare variable $event external;

declare %updating function local:click-svg($leveldoc, $use) {
    if (not(empty($use/@chain:row)) and not(empty($use/@chain:column))) then
    (
        let $field := $leveldoc/chain:field
            , $unvisited := $field[@state = 'unvisited']
            , $new-field := $field[@row = $use/@chain:row][@column = $use/@chain:column]
            , $current-field := $field[@state = 'current']
            , $current-row := data($current-field/@row)
            , $current-col := data($current-field/@column)
            , $new-row := data($new-field/@row)
            , $new-col := data($new-field/@column)
            , $current-svg-color := $use/../svg:use[@chain:row = $current-row][@chain:column = $current-col]/@color
            , $new-svg-color := $use/@color
        return
        (
            if (data($new-field/@state) = 'current') then 
                b:alert('Same position')
            else if ($new-row != $current-row and $new-col != $current-col) then
                b:alert('Bad move: Stay in row or column')
            else if ($new-field/@state = 'visited') then
                b:alert('Bad move: Already been there')
            else if ($new-field/@shape != $current-field/@shape and $new-field/@color != $current-field/@color) then
                b:alert('Bad move: Must match colour or shape')
            else
            (
                if (count($unvisited) = 1) then b:alert('Solved!') else (),
                replace value of node $current-field/@state with 'visited',
                replace value of node $new-field/@state with 'current',
                replace value of node $current-svg-color with 'white',
                replace value of node $new-svg-color with 'black'
            )
        )
    )
    else
        ()
};

local:click-svg($leveldoc, .)
`
    , level = "chain-level" + game.getQueryVariable("level", "1") + ".xml"
    ;

game.game(
    level,
    load_xq,
    {
        click: click_xq
    }
);
