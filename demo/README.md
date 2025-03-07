## SVG games using XQUF

I have implemented a XQUF game engine. Starting with an SVG template, it loads and XML level e.g. `chainlevel1.xml` and using an XQUF query `load_xq` it appends the level to the SVG. The second argument to `game.game` is an object, keys is are event types e.g. `click`  and the values are XQUF query to be executed when an event is triggered.

    import * as game from './game';
    
    const
        load_xq = <xquf query>
        , click_xq = <xquf query>
        , level = "chain-level" + game.getQueryVariable("level", "1") + ".xml"
        ;
    
    game.game(
	    level,
	    load_xq,
	    {
	        click: click_xq
	    }
	);

 The games are based on [clickmaze](https://clickmazes.com/)'s [chainreaction](https://clickmazes.com/chain/new-chain.htm) and [BoxUp](https://clickmazes.com/boxup/new-boxup.htm) games.
 