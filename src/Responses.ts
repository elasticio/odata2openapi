import Response from './Response';
import Reference from './Reference';

interface Responses {
  default?: Response | Reference;
  [httpStatusCode: string]: Response | Reference;
}

export default Responses;
