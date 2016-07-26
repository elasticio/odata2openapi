import Responses from './Responses';

// https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#operationObject
interface Operation {
  operationId?: string;
  responses: Responses;
}

export default Operation;
