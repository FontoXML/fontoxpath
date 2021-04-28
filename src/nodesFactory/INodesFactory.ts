import { Document } from '../types/Types';
import ISimpleNodesFactory from './ISimpleNodesFactory';

/**
 * Defines the factory methods used in XQuery. Basically equivalent to the Document interface, but
 * with the 'createDocument' factory method added.
 *
 * @public
 */
export default interface INodesFactory extends ISimpleNodesFactory {
	createDocument(): Document;
}
