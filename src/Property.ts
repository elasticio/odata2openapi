import Reference from './Reference';
import Schema from './Schema';

interface Property {
  type: string;
  format?: string;
  minimum?: number;
  maximum?: number;
  default?: any;
  items?: Schema | Reference;
  properties?: {[propertyName: string]: Property};
}

export default Property;
