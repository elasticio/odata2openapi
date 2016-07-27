import Schema from './Schema';
import Reference from './Reference';

interface Response {
  description: string;
  schema?: Schema | Reference;
}

export default Response;
