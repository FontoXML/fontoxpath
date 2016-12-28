import DomFacade from '../DomFacade';
import Item from './dataTypes/Item';

/**
 * @typedef {DynamicContext|{contextItem:Item, contextSequence: ?Array<Item>}|{contextItem:Item}|{contextSequence: Array<Item>}|{domFacade:!DomFacade}|{variables:Object}}|{contextItem: *=, contextSequence: ?Array<Item>=, domFacade: !DomFacade, variables: Object=}}
 */
var ScopingType;

/**
 * @constructor
 * @param  {ScopingType}  context  The context to overlay
 */
function DynamicContext (context) {
    this.contextItem = context.contextItem;
    this.contextSequence = context.contextSequence;
    this.domFacade = context.domFacade;
    this.variables = context.variables;
}

/**
 * @param   {!ScopingType}  overlayContext
 * @return  {!DynamicContext}
 */
DynamicContext.prototype.createScopedContext = function (overlayContext) {
    return new DynamicContext({
        contextItem: overlayContext.contextItem ? overlayContext.contextItem : this.contextItem,
        contextSequence: overlayContext.contextSequence ? overlayContext.contextSequence : this.contextSequence,
        domFacade: overlayContext.domFacade ? overlayContext.domFacade : this.domFacade,
        variables: overlayContext.variables ? Object.assign({}, this.variables, overlayContext.variables) : this.variables
    });
};

export default DynamicContext;
