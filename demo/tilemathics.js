import * as game from './game';

const
    load_xq =
`
declare namespace tm="http://mansoft.nl/tilemathics";
declare namespace xlink="http://www.w3.org/1999/xlink";
declare namespace svg="http://www.w3.org/2000/svg";

declare variable $webdoc external;
declare variable $leveldoc external;

declare variable $tilemathics-fields :=
<tm:fields>
    <tm:field field="2" type="conveyor" dx="-1" dy="0" symbol="←" color="black"/>
    <tm:field field="3" type="conveyor" dx="1" dy="0" symbol="→" color="black"/>
    <tm:field field="4" type="wall"/>
    <tm:field field="5" type="mover-changer" symbol="½" color="black" operator="/" operand="2" remove="true"/>
    <tm:field field="6" type="mover-changer" symbol="-1" color="black" operator="+" operand="-1" remove="true"/>
    <tm:field field="7" type="mover-changer" symbol="+1" color="black" operator="+" operand="1" remove="true"/>
    <tm:field field="8" type="mover-changer" symbol="*2" color="black" operator="*" operand="2" remove="true"/>
    <tm:field field="9" type="goal" symbol="X" color="cyan"/>
    <tm:field field="10" type="wall"/>
    <tm:field field="41" type="mover-changer" symbol="½" color="white" operator="/" operand="2" remove="false"/>
    <tm:field field="42" type="mover-changer" symbol="-1" color="white" operator="+" operand="-1" remove="false"/>
    <tm:field field="43" type="mover-changer" symbol="+1" color="white" operator="+" operand="1" remove="false"/>
    <tm:field field="44" type="mover-changer" symbol="*2" color="white" operator="*" operand="2" remove="false"/>
    <tm:field field="45" type="mover-changer" symbol="⅓" color="black" operator="/" operand="3" remove="true"/>
    <tm:field field="46" type="mover-changer" symbol="+2" color="black" operator="+" operand="2" remove="true"/>
    <tm:field field="47" type="mover-changer" symbol="-2" color="black" operator="+" operand="-2" remove="true"/>
    <tm:field field="48" type="mover-changer" symbol="⅓" color="white" operator="/" operand="3" remove="false"/>
    <tm:field field="49" type="conveyor" dx="0" dy="1" symbol="↓" color="black"/>
    <tm:field field="50" type="conveyor" dx="0" dy="-1" symbol="↑" color="black"/>
    <tm:field field="61" type="mover-changer" symbol="+3" color="white" operator="+" operand="3" remove="false"/>
    <tm:field field="62" type="mover-changer" symbol="-3" color="white" operator="+" operand="-3" remove="false"/>
    <tm:field field="63" type="mover-changer" symbol="+3" color="black" operator="+" operand="3" remove="true"/>
    <tm:field field="64" type="mover-changer" symbol="-3" color="black" operator="+" operand="-3" remove="true"/>
    <tm:field field="65" type="mover-changer" symbol="*3" color="white" operator="*" operand="3" remove="false"/>
    <tm:field field="66" type="mover-changer" symbol="*3" color="black" operator="*" operand="3" remove="true"/>
    <tm:field field="67" type="mover-changer" symbol="-2" color="white" operator="+" operand="-2" remove="false"/>
    <tm:field field="68" type="mover-changer" symbol="+2" color="white" operator="+" operand="2" remove="false"/>
    <tm:field field="69" type="four-arrows" use-id="#arrows4"/>
    <tm:field field="82" type="one-way" symbol="←" color="white" dx="1" dy="0"/>
    <tm:field field="83" type="one-way" symbol="→" color="white" dx="-1" dy="0"/>
    <tm:field field="84" type="one-way" symbol="↓" color="white" dx="0" dy="-1"/>
    <tm:field field="85" type="one-way" symbol="↑" color="white" dx="0" dy="1"/>
    <tm:field field="86" type="mover-incr-decr" symbol="←" color="blue" increment="1" dx="1" dy="0"/>
    <tm:field field="87" type="mover-incr-decr" symbol="→" color="blue" increment="1" dx="-1" dy="0"/>
    <tm:field field="88" type="mover-incr-decr" symbol="↓" color="blue" increment="1" dx="0" dy="-1"/>
    <tm:field field="89" type="mover-incr-decr" symbol="↑" color="blue" increment="1" dx="0" dy="1"/>
    <tm:field field="91" type="mover-incr-decr" symbol="←" color="red" increment="-1" dx="1" dy="0"/>
    <tm:field field="92" type="mover-incr-decr" symbol="→" color="red" increment="-1" dx="-1" dy="0"/>
    <tm:field field="93" type="mover-incr-decr" symbol="↓" color="red" increment="-1" dx="0" dy="-1"/>
    <tm:field field="94" type="mover-incr-decr" symbol="↑" color="red" increment="-1" dx="0" dy="1"/>
    <tm:field field="95" type="mover" use-id="#left-right-up-down" allowed="all"/>
    <tm:field field="96" type="mover" use-id="#left-right" allowed="left-right"/>
    <tm:field field="97" type="mover" use-id="#up-down" allowed="up-down" />
</tm:fields>
;

declare function local:create-text($text as xs:string, $fill as xs:string) as element() {
    <text xmlns="http://www.w3.org/2000/svg" x="5" y="6.7" font-family="Verdana" text-anchor="middle" font-size="5.0" fill="{$fill}">
        { $text }
    </text>
};

declare function local:create-use($href as xs:string) as element() {
    <use xmlns="http://www.w3.org/2000/svg" xlink:href="{$href}"/>
};

declare function local:create-inner-square($color as xs:string, $text as xs:string) as element()* {
    <use xmlns="http://www.w3.org/2000/svg" xlink:href="#inner-square" fill="{$color}"/>,
    <text xmlns="http://www.w3.org/2000/svg" x="5" y="6.7" font-family="Verdana" text-anchor="middle" font-size="5.0" fill="{$color}">
        { $text }
    </text>
};

declare function local:create-inner-square($color as xs:string, $text as xs:string, $stroke as xs:string) as element()* {
    <use xmlns="http://www.w3.org/2000/svg" xlink:href="#inner-square" fill="{$color}"/>,
    <text xmlns="http://www.w3.org/2000/svg" x="5" y="6.7" font-family="Verdana" text-anchor="middle" font-size="5.0" fill="{$color}" stroke-width="0.15" stroke="{$stroke}">
        { $text }
    </text>
};


declare function local:process-field($x as xs:integer, $y as xs:integer, $layer as xs:integer, $field as xs:integer) as element()* {
        let $current-field := $tilemathics-fields/tm:field[@field = $field]
        , $tilemathics-attributes :=
          if (not(empty($current-field))) then
            $current-field/@*
          else if ($field eq 1) then
            ()
          else if ($field ge 11 and $field le 20) then
            (attribute selected { false() }, attribute type {"mover"}, attribute increment { 0}, attribute symbol {$field - 11}, attribute color {"black"})
          else if ($field ge 21 and $field le 30) then
            (attribute selected { false() }, attribute type {"mover"}, attribute increment {-1}, attribute symbol {$field - 21}, attribute color {"red"})
          else if ($field ge 31 and $field le 40) then
            (attribute selected { false() }, attribute type {"mover"}, attribute increment { 1}, attribute symbol {$field - 31}, attribute color {"blue"})
          else if ($field ge 51 and $field le 60) then
            (attribute type {"goal"}, attribute symbol {$field - 51}, attribute color {"cyan"})
          else if ($field ge 71 and $field le 80) then
            (attribute type {"mover-match"}, attribute symbol {$field - 71}, attribute color {"magenta"})
          else
            ()
    return
        <tm:field layer="{$layer}" x="{$x}" y="{$y}">        
          {
            if (not(empty($tilemathics-attributes))) then attribute id { concat('l', $layer, '-x', $x, '-y', $y) } else (),
            $tilemathics-attributes
          }
        </tm:field>
};

declare function local:process-tilemathics-field($field as element(), $selected as xs:boolean*) as element()* {
<g xmlns="http://www.w3.org/2000/svg" transform="translate({($field/@x - 1) * 10 + 1}, {($field/@y - 1) * 10 + 1})">
{
    if (not(empty($field/@id))) then (attribute id {$field/@id}) else (),
    <use xmlns="http://www.w3.org/2000/svg" xlink:href="#square" stroke='black' fill="{if ($field/@layer = 1) then 'green' else if ($selected = true()) then 'orange' else 'yellow'}"/>,
    if (not(empty($field/@symbol))) then
        local:create-text($field/@symbol, $field/@color)
    else if (not(empty($field/@use-id))) then
        local:create-use($field/@use-id)
    else
        ()
}
</g>
};

declare function local:process-tilemathics-fields($fields as element()*) as element()* {
   for $field as element(tm:field) in $fields
   return local:process-tilemathics-field($field, $field/@selected)
};



declare function local:copy-model($level) {
  let $levelWidth := xs:integer($level/levelWidth/text())
    , $levelHeight := xs:integer($level/levelHeight/text())
  return
  copy $model :=
    <tm:level width="{$levelWidth}" height="{$levelHeight}">
    {
     for $layer as xs:string at $position in $level/Layers/Layer
     let
       $layerrows := tokenize($layer/text(), '\\|')
       for $y in 1 to $levelHeight
         let $fieldvalues := tokenize($layerrows[$y], ',\\s*')
         for $x in 1 to $levelWidth
           let $field := xs:integer($fieldvalues[$x])
           return
             if ($field != 0) then local:process-field($x, $y, $position, $field) else ()    
    }
    </tm:level>
  (: select first mover :)
  modify ( replace value of node $model/tm:field[@type="mover"][1]/@selected with true() )
  return $model
};

declare %updating function local:load-svg($svg, $model) {
  let $layer1 := $model/tm:field[@layer = '1']
    , $layer2 := $model/tm:field[@layer = '2']
  return
  (
    replace value of node $svg/@viewBox with concat("0 0 ", data($model/@width) * 10 + 2, " ", data($model/@height) * 10 + 2),
    replace node $webdoc/svg:svg/svg:title/text() with concat("Tilemathics level ", $levelnr),
    insert node local:process-tilemathics-fields($layer1) as last into $svg,
    insert node local:process-tilemathics-fields($layer2[not(@type = 'mover')]) as last into $svg,
    insert node local:process-tilemathics-fields($layer2[@type = 'mover']) as last into $svg
  )  
};

let $model := local:copy-model($leveldoc/Level)
return
(
    local:load-svg($webdoc/svg:svg, $model),
    replace node $leveldoc/Level with $model
)
`
    , keydown_xq = 
`
declare namespace tm="http://mansoft.nl/tilemathics";
declare namespace xlink="http://www.w3.org/1999/xlink";
declare namespace svg="http://www.w3.org/2000/svg";

declare variable $webdoc external;
declare variable $leveldoc external;

declare function local:get-transform($x as xs:integer, $y as xs:integer) as xs:string {
    concat("translate(", ($x - 1) * 10 + 1, " ", ($y - 1) * 10 + 1, ")")
};

declare function local:get-svg-element($id as xs:string) as element() {
    $webdoc/svg:svg/svg:g[@id = $id]
};

declare function local:incr-decr-new-value($new-field as element(), $dx as xs:integer, $dy as xs:integer) as xs:integer {
    if ($dx = xs:integer($new-field/@dx) and $dy = xs:integer($new-field/@dy)) then xs:integer($new-field/@increment) else 0
};

declare function local:four-arrows-new-value($dx as xs:integer, $dy as xs:integer) as xs:integer {
    if ($dx = -1 or $dy = 1) then -1 else 1
};

declare %updating function local:update-mover-value($mover as element(), $mover-value as xs:integer) {
    (
        replace value of node $mover/@symbol with $mover-value,
        replace value of node local:get-svg-element($mover/@id)/svg:text/text() with $mover-value
    )
};

declare %updating function local:update-mover($mover as element(), $mover-value as xs:integer, $x as xs:integer, $y as xs:integer) {
    let $svg-mover := local:get-svg-element($mover/@id)
    return
    (
        replace value of node $mover/@x with $x,
        replace value of node $mover/@y with $y,
        replace value of node $svg-mover/@transform with local:get-transform($x, $y),
        replace value of node $mover/@symbol with $mover-value,
        replace value of node $svg-mover/svg:text/text() with $mover-value
    )
};

declare %updating function local:normal-move($mover as element(), $mover-value as xs:integer?, $x as xs:integer, $y as xs:integer) {
    if ($mover-value ge 0 and $mover-value lt 10) then
    (
        b:play-sound('move'),
        local:update-mover($mover, $mover-value, $x, $y)
    )
    else
        ()
};

declare function local:get-new-field($new-fields as element()*) as element()? {
    let
        $new-field-l1 := $new-fields[@layer = '1']
        , $new-field-l2 := $new-fields[@layer = '2']
        return
            if (empty($new-field-l2)) then $new-field-l1 else $new-field-l2
};

declare %updating function local:select-mover($current-mover as element(), $new-mover as element()) {
    if ($current-mover is $new-mover) then
        ()
    else
    (
        replace value of node $current-mover/@selected with false(),
        replace value of node $new-mover/@selected with true(),
        replace value of node local:get-svg-element($current-mover/@id)/svg:use/@fill with 'yellow',
        replace value of node local:get-svg-element($new-mover/@id)/svg:use/@fill with 'orange'
    )
};

declare %updating function local:check-for-win($x as xs:integer, $y as xs:integer, $goal-ok as xs:integer) {
    let
        $movers := $leveldoc/tm:level/tm:field[@type = 'mover'][@selected = "false"]
        , $goals := $leveldoc/tm:level/tm:field[@type = 'goal']
        , $movers-on-goals := for $goal in $goals return $movers[@x = $goal/@x and @y = $goal/@y and ($goal/@symbol = 'X' or $goal/@symbol = @symbol)]
    return
        if (count($movers-on-goals) + $goal-ok ge count($goals)) then
            b:play-sound('winner')
        else
            ()
};


declare %updating function local:move($mover as element(), $dx as xs:integer, $dy as xs:integer) {
    let
        $model := $leveldoc/tm:level
        , $x := xs:integer($mover/@x) + $dx
        , $y := xs:integer($mover/@y) + $dy
        , $new-field := local:get-new-field($model/tm:field[@x = $x][@y = $y][@type])
        , $new-field-type := xs:string($new-field/@type)
        , $old-mover-value := xs:integer($mover/@symbol)
        , $mover-value := $old-mover-value + xs:integer($mover/@increment)
    return
        if ($x lt 1 or $y lt 1 or $x gt xs:integer($model/@width) or $y gt xs:integer($model/@height) or $new-field-type = 'wall' or $old-mover-value = 0) then
            ()
        else
        (
            switch ($new-field-type)
                case 'mover-changer' return
                (
                    let
                        $operator := xs:string($new-field/@operator)
                        , $operand := xs:integer($new-field/@operand)
                        , $updated-mover-value := if ($operator = '+') then $mover-value + $operand else if ($operator = '*') then $mover-value * $operand else if ($mover-value mod $operand = 0) then $mover-value idiv $operand else -1
                    return
                    (
                        if ($updated-mover-value ge 0 and $updated-mover-value lt 10) then
                        (
                            b:play-sound('move'),
                            local:update-mover($mover, $updated-mover-value, $x, $y),
                            if (xs:boolean($new-field/@remove)) then
                            (
                                delete node $new-field/@id,
                                delete node $new-field/@field,
                                delete node $new-field/@type,
                                delete node $new-field/@symbol,
                                delete node $new-field/@color,
                                delete node $new-field/@operator,
                                delete node $new-field/@operand,
                                delete node $new-field/@remove,
                                delete node local:get-svg-element($new-field/@id)/svg:text
                            )
                            else
                                ()
                        )
                        else
                            ()
                    )
                )
                case 'mover' return
                (
                    let
                        $updated-mover-value := $old-mover-value - 1
                        , $new-field-value := xs:integer($new-field/@symbol) + 1
                    return
                    (
                        if ($new-field-value lt 10) then
                        (
                            b:play-sound('tick'),
                            local:update-mover-value($mover, $updated-mover-value),
                            local:update-mover-value($new-field, $new-field-value)
                        )
                        else
                            ()
                    )
                )
                case 'conveyor' return
                (
                    let
                        $new-field2 := $model/tm:field[@x = $x + $dx][@y = $y + $dy][@type = 'mover']
                    return
                        if (not(empty($new-field2)) and $dx = xs:integer($new-field/@dx) and $dy = xs:integer($new-field/@dy)) then
                            let $new-field2-value := xs:integer($new-field2/@symbol) + 1
                            return if ($new-field2-value lt 10) then
                            (
                                b:play-sound('tick'),
                                local:update-mover-value($mover, $old-mover-value - 1),
                                local:update-mover-value($new-field2, $new-field2-value)
                            )
                            else
                                ()
                        else
                            ()
                )
                case 'goal' return
                (
                    let $goal-sound := if ($new-field/@symbol = 'X' or xs:integer($new-field/@symbol) = $mover-value) then 'lock' else 'wrong'
                    return
                    (
                        b:play-sound($goal-sound),
                        local:normal-move($mover, $mover-value, $x, $y),
                        local:check-for-win($x, $y, if ($goal-sound = 'lock') then 1 else 0)
                    )
                )
                case 'mover-incr-decr' return
                (
                    let $updated-mover-value := $mover-value + local:incr-decr-new-value($new-field, $dx, $dy)
                    return 
                    if ($updated-mover-value ge 0 and $updated-mover-value lt 10) then
                        local:normal-move($mover, $updated-mover-value, $x, $y)
                    else
                        ()
                )
                case 'four-arrows' return
                (
                    let $updated-mover-value := $mover-value + local:four-arrows-new-value($dx, $dy)
                    return 
                    if ($updated-mover-value ge 0 and $updated-mover-value lt 10) then
                        local:normal-move($mover, $updated-mover-value, $x, $y)
                    else
                        ()
                )
                case 'one-way' return
                (
                    if (xs:integer($new-field/@dx) != $dx or xs:integer($new-field/@dy) != $dy) then
                        local:normal-move($mover, $mover-value, $x, $y)
                    else
                        ()
                )
                case 'mover-match' return
                (
                    if (xs:integer($new-field/@symbol) = $mover-value) then
                        local:normal-move($mover, $mover-value, $x, $y)
                    else
                        ()
                )
                default
                    return local:normal-move($mover, $mover-value, $x, $y)
        )
};

declare %updating function local:keydown-svg($evtObj) {
  let $key := $evtObj/key
      , $mover := $leveldoc/tm:level/tm:field[@type = 'mover'][@selected = 'true']
  return
    if ($key = 'ArrowLeft') then local:move($mover, -1, 0) else
    if ($key = 'ArrowRight') then local:move($mover, 1, 0) else
    if ($key = 'ArrowUp') then local:move($mover, 0, -1) else
    if ($key = 'ArrowDown') then local:move($mover, 0, 1) else
    (
        let
            $next-mover := $mover/following-sibling::tm:field[@type = 'mover'][1]
            , $movers := $leveldoc/tm:level/tm:field[@type = 'mover']
        return local:select-mover($mover, if (empty($next-mover)) then $movers[1] else $next-mover)
    )
};

local:keydown-svg($event)
`
    , levelnr = game.getQueryVariable("level", "1")
    , level = "map" + levelnr + ".xml"
    ;

game.load_sounds(
    [
        { name: "move", href: "move.wav"},
        { name: "lock", href: "lock.wav"},
        { name: "wrong", href: "wrong.wav"},
        { name: "tick", href: "tick.wav"},
        { name: "winner", href: "winner.wav"}
    ]
);
game.game(
    level,
    levelnr,
    load_xq,
    {
        keydown: keydown_xq
    }
);
