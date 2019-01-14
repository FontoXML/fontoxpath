import IDomFacade from './IDomFacade';
import ExternalDomFacade from './ExternalDomFacade';
import { ConcreteNode } from './ConcreteNode';

export default interface IWrappingDomFacade extends IDomFacade {
	orderOfDetachedNodes: ConcreteNode[];
	unwrap(): ExternalDomFacade;
}
