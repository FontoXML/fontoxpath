import { ConcreteNode } from './ConcreteNode';
import ExternalDomFacade from './ExternalDomFacade';
import IDomFacade from './IDomFacade';

export default interface IWrappingDomFacade extends IDomFacade {
	orderOfDetachedNodes: ConcreteNode[];
	unwrap(): ExternalDomFacade;
}
