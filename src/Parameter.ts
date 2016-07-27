import Reference from './Reference';

interface Parameter {
  name: string;
  in: string;
  required: boolean;
  schema?: Reference;
}

export default Parameter;
