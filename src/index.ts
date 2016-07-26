import * as url from 'url';

import Swagger from './Swagger';
import get from './get';
import parse from './parse';

function odata2openapi(metadataUrl: string): Promise<Swagger> {
  const { path, host } = url.parse(metadataUrl);

  return get(host, path).then(xml => parse(host, path, xml))
}

export default odata2openapi;
