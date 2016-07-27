import * as url from 'url';

import Swagger from './Swagger';
import Options from './Options';
import get from './get';
import parse from './parse';
import convert from './convert';

function odata2openapi(metadataUrl: string, options?: Options): Promise<Swagger> {
  const { path, host } = url.parse(metadataUrl);

  if (!options) {
    options = {
      basePath: path.replace(/\/\$metadata$/, ''),
      host
    };
  }

  return get(host, path).then(parse).then(entitySets => convert(entitySets, options))
}

export {
  Options,
  odata2openapi,
  convert,
  parse
}
