import IDomFacade from './IDomFacade';

// This represents the domFacade FontoXPath may receive from the outside.
// It looks and feels the same as a normal IDomFacade, excluding the orderOfDetachedNodes field
export default interface IExternalDomFacade extends IDomFacade {}
