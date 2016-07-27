import Reference from './Reference';

interface Parameter {
  name: string;
  in: string;
  required: boolean;
  schema?: Reference;
  type?: string;
  format?: string;
}

export default Parameter;
