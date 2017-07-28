import { Swagger } from './Swagger';
import { Options } from './Options';
import { EntitySet } from './EntitySet';
declare function convert(entitySets: Array<EntitySet>, options: Options, oDataVersion?: string): Swagger;
export default convert;
