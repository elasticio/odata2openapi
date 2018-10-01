import { ReturnType } from './ReturnType';
import { Parameter } from './Parameter';

export interface FunctionImport {
  name: string;
  label: string;
  httpMethod: string;
  parameters?: Array<Parameter>;
  entitySet?: string;
  returnType: ReturnType;
}
