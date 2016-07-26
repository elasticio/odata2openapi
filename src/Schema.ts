import Property from './Property';

interface Schema {
  type?: string;
  required?: Array<string>;
  properties?: {[propertyName: string]: Property};
}

export default Schema;
