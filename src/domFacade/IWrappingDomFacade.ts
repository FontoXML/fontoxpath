import IDomFacade from './IDomFacade';
import IExternalDomFacade from './IExternalDomFacade';
import { ConcreteNode } from './ConcreteNode';

export default interface IWrappingDomFacade extends IDomFacade {
	orderOfDetachedNodes: ConcreteNode[];
	unwrap(): IExternalDomFacade;
}
