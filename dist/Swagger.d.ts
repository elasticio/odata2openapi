import { Info } from './Info';
import { Paths } from './Paths';
import { Definitions } from './Definitions';
import { SecurityDefinitions } from './SecurityDefinitions';
import { SecurityRequirement } from './SecurityRequirement';
export interface Swagger {
    swagger: '2.0';
    info: Info;
    host?: string;
    basePath?: string;
    schemes?: Array<string>;
    paths: Paths;
    produces: Array<string>;
    definitions: Definitions;
    security?: Array<SecurityRequirement>;
    securityDefinitions?: SecurityDefinitions;
}
