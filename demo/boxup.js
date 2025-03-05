import * as game from './game';

const
	load_xq =
`
declare namespace boxup="http://mansoft.nl/boxup";
declare namespace boxup-vars="http://mansoft.nl/boxup-vars";
declare namespace xlink="http://www.w3.org/1999/xlink";
declare namespace svg="http://www.w3.org/2000/svg";

declare variable $leveldoc external;

declare function local:transform($column, $row, $rotation) {
    concat('translate(', $column - 1, ', ', $row - 1, ') rotate(', $rotation, ', 0.5, 0.5)')
};

declare function local:process-mover($mover) {
	<use xmlns="http://www.w3.org/2000/svg" id="use-mover" xlink:href="#mover" transform="{local:transform($mover/@column, $mover/@row, 0)}"/>
};

declare function local:process-blocks($blocks)  {
    for $block in $blocks
    return
        <use xmlns="http://www.w3.org/2000/svg" xlink:href="#block" transform="{local:transform($block/@column, $block/@row, 0)}">
            { $block }
        </use>
};

declare function local:process-boxes($boxes)  {
    for $box in $boxes
    let $column := $box/@column
        , $row := $box/@row
        , $depth := $box/@depth
	    , $box-sizes :=
    <box-sizes xmlns="http://mansoft.nl/boxup-vars">
        <box-size depth="1" use="#big-box"/>
        <box-size depth="2" use="#small-box"/>
    </box-sizes>
        , $box-use := $box-sizes/boxup-vars:box-size[@depth eq $box/@depth]/@use
	    , $box-colors := 
    <box-colors xmlns="http://mansoft.nl/boxup-vars">
        <box-color box-type="normal" color="black"/>
        <box-color box-type="source" color="red"/>
        <box-color box-type="destination" color="blue"/>
    </box-colors>
        , $box-color := $box-colors/boxup-vars:box-color[@*:box-type eq $box/@*:box-type]/@color
        , $dx := $box/@dx
        , $dy := $box/@dy
	    , $rotations := 
    <rotations xmlns="http://mansoft.nl/boxup-vars">
        <rotation dx="0" dy="1" rotation="0"/>
        <rotation dx="0" dy="-1" rotation="180"/>
        <rotation dx="1" dy="0" rotation="-90"/>
        <rotation dx="-1" dy="0" rotation="90"/>
    </rotations>
        , $rotation := $rotations/boxup-vars:rotation[@dx eq $dx][@dy eq $dy]/@rotation
        , $transform := local:transform($column, $row, $rotation)
    return
        <use xmlns="http://www.w3.org/2000/svg" boxup:row="{$row}" boxup:column="{$column}" boxup:depth="{$depth}" xlink:href="{$box-use}" transform="{$transform}" stroke="{$box-color}">
        </use>
};

declare %updating function local:load-svg($leveldoc, $svg) {
    let $boxup-game := $leveldoc
        , $columns := xs:integer($boxup-game/@columns)
        , $rows := xs:integer($boxup-game/@rows)
    return
	(
		replace value of node $svg/@viewBox with concat("-0.1 -0.1 ", $columns + 0.2, " ", $rows + 0.2),
		for $y in 0 to $rows - 1, $x in 0 to $columns - 1
			return (
				insert node <use xmlns="http://www.w3.org/2000/svg" xlink:href="#empty" x="{$x}" y="{$y}"/> as last into $svg),
		for $box in local:process-boxes($boxup-game/boxup:box)
		return
			insert node $box as last into $svg,
		insert node local:process-mover($boxup-game/boxup:mover) as last into $svg,
		insert node local:process-blocks($boxup-game/boxup:block) as last into $svg
	)
};

local:load-svg($leveldoc, .)
`
	, keydown_xq = 
`
declare namespace boxup="http://mansoft.nl/boxup";
declare namespace boxup-vars="http://mansoft.nl/boxup-vars";
declare namespace xlink="http://www.w3.org/1999/xlink";
declare namespace svg="http://www.w3.org/2000/svg";

declare function local:transform($column, $row, $rotation) {
    concat('translate(', $column - 1, ', ', $row - 1, ') rotate(', $rotation, ', 0.5, 0.5)')
};

declare %updating function local:move-mover($model-mover, $svg-mover, $x, $y) {
  replace value of node $svg-mover/@transform with local:transform($x, $y, 0),
  replace value of node $model-mover/@column with $x,
  replace value of node $model-mover/@row with $y  
};

declare function local:get-rotation($box) {
  let $dx := xs:integer($box/@dx)
      , $dy := xs:integer($box/@dy)
  return
    if ($dx eq 0) then
      (if ($dy eq 1) then 0 else 180)
    else
      (if ($dx eq 1) then -90 else 90)
};

declare function local:check-win($box, $dest-box, $new-column, $new-row) {
  if ($box/@box-type="source" and $new-column eq xs:integer($dest-box/@column) and $new-row eq xs:integer($dest-box/@row)) then
    b:alert('Solved!')
  else
    ()
};


declare %updating function local:move-box($box, $svg-box, $new-column, $new-row) {
  replace value of node $box/@column with $new-column,
  replace value of node $box/@row with $new-row,  
  replace value of node $svg-box/@transform with local:transform($new-column, $new-row, local:get-rotation($box)),
  replace value of node $svg-box/@boxup:column with $new-column,
  replace value of node $svg-box/@boxup:row with $new-row
};


declare %updating function local:update($model-mover, $svg-mover, $x, $y, $new-x, $new-y, $dx, $dy) {
  let $boxes := $model-mover/../boxup:box
      , $mover-boxes := $boxes[@column eq $model-mover/@column][@row eq $model-mover/@row]
  return
  (
    local:move-mover($model-mover, $svg-mover, $new-x, $new-y),
    for $box in $mover-boxes
    let $box-depth1 := $mover-boxes[xs:integer(@depth) = 1]
        , $svg-box := $svg-mover/../svg:use[xs:integer(@boxup:column) eq xs:integer($box/@column)][xs:integer(@boxup:row) eq xs:integer($box/@row)][xs:integer(@boxup:depth) eq xs:integer($box/@depth)]
    return
      if (xs:integer($box/@dx) ne -$dx or xs:integer($box/@dy) ne -$dy or xs:integer($box/@depth) eq 2 and not(empty($box-depth1)) and (xs:integer($box-depth1/@dx) ne -$dx or xs:integer($box-depth1/@dy) ne -$dy)) then
        (
          local:move-box($box, $svg-box, $new-x, $new-y),
          local:check-win($box, $boxes[@box-type="destination"], $new-x, $new-y)
        )
      else ()
    )
};

declare function local:max-depth2($boxes, $column, $row) {
  for $box in $boxes[xs:integer(@column) eq $column][xs:integer(@row) eq $row]
  order by xs:integer($box/@depth) descending
  return $box
};

declare function local:max-depth($boxes, $column, $row) {
  local:max-depth2($boxes, $column, $row)[1]
};

declare %updating function local:check-move($model-mover, $svg-mover, $dx, $dy)  {
  let $column := xs:integer($model-mover/@column)
      , $row := xs:integer($model-mover/@row)
      , $new-column := $column + $dx
      , $new-row := $row + $dy
      , $model-element := $model-mover/..
      , $boxes := $model-element/boxup:box
      , $blocks := $model-element/boxup:block
return
  (
    (: b:preventDefault(), :)
    if ($new-column gt 0 and $new-column le xs:integer($model-element/@columns) and $new-row gt 0 and $new-row le xs:integer($model-element/@rows) and empty($blocks[@column eq $new-column][@row eq $new-row])) then
    (
      let $current-box := local:max-depth($boxes, $column, $row)
          , $new-box := local:max-depth($boxes, $new-column, $new-row)
      return
        if
          (
            empty($new-box) or
            xs:integer($new-box/@dx) eq $dx and xs:integer($new-box/@dy) eq $dy and (
              empty($current-box) or xs:integer($current-box/@depth) gt xs:integer($new-box/@depth) or xs:integer($current-box/@dx) eq -xs:integer($new-box/@dx) and xs:integer($current-box/@dy) eq -xs:integer($new-box/@dy))
          )
        then
            local:update($model-mover, $svg-mover, $column, $row, $new-column, $new-row, $dx, $dy)
        else
          ()      
    )
    else
      ()
  )
};

declare %updating function local:keydown-svg($leveldoc, $svg, $evtObj) {
  let $key := $evtObj/key
      , $model-mover := $leveldoc/boxup:mover
      , $svg-mover := $svg/svg:use[@xlink:href='#mover']

  return
    if ($key = 'ArrowLeft') then local:check-move($model-mover, $svg-mover, -1, 0) else
    if ($key = 'ArrowRight') then local:check-move($model-mover, $svg-mover, 1, 0) else
    if ($key = 'ArrowUp') then local:check-move($model-mover, $svg-mover, 0, -1) else
    if ($key = 'ArrowDown') then local:check-move($model-mover, $svg-mover, 0, 1) else
    ()
};

local:keydown-svg($leveldoc, ., $event)
`
	, level = "level" + game.getQueryVariable("level", "1") + ".xml"
	;

game.game(
	level,
	load_xq,
	{
		keydown: keydown_xq
	}
);
