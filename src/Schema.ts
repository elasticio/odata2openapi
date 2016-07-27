import Property from './Property';
import Reference from './Reference';

interface Schema {
  type: string;
  required?: Array<string>;
  items?: Schema | Reference;
  properties?: {[propertyName: string]: Property};
}

export default Schema;
