import { Responses } from './Responses';
import { Parameter } from './Parameter';

// https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#operationObject
export interface Operation {
  operationId: string;
  parameters?: Array<Parameter>;
  responses: Responses;
}
