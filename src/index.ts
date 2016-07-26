import Swagger from './Swagger';
import get from './get';

function parse(xml: string): Promise<Swagger> {
  return Promise.resolve(null);
}

function odata2openapi(metadataUrl:string) : Promise<Swagger> {
  return get(metadataUrl).then(parse)
}

export default odata2openapi;
