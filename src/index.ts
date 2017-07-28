import * as url from 'url';
import { RequestOptions } from './RequestOptions';
import { Swagger } from './Swagger';
import { Options } from './Options';
import get from './get';
import parse from './parse';
import convert from './convert';

function odata2openapi(metadataUrl: string, options?: Options, requestOptions?: RequestOptions,
  headers?: { [key: string]: any }): Promise<Swagger> {
  const { path, host, protocol } = url.parse(metadataUrl);

  if (!options) {
    options = {
      basePath: path.replace(/\/\$metadata$/, ''),
      host
    };
  }
  if (!headers) {
    headers = {
      'Accept': '*/*',
      'User-Agent': 'odata2openapi'
    };
  }
  if (!requestOptions) {
    let hostSplit = host.split(':');
    requestOptions = {
      hostname: hostSplit[0],
      port: hostSplit.length > 1 ? Number(hostSplit[1]) : 80,
      method: 'GET',
      headers: headers,
      path
    };
  }

  return get(protocol, host, path, options, requestOptions).then(parse).then(service => convert(service.entitySets, options, service.version))
}

export {
  Options,
  odata2openapi,
  convert,
  parse
}

export * from './Swagger';
export * from './Definitions';
export * from './EntityProperty';
export * from './EntityType';
export * from './EntitySet';
export * from './Operation';
export * from './Operation';
export * from './Paths';
export * from './Property';
export * from './Schema';
export * from './PathItem';
export * from './Operation';
export * from './Definitions';
export * from './Options';
export * from './Parameter';
export * from './Reference';
export * from './Response';
export * from './SecurityDefinition';
export * from './SecurityDefinitions';
export * from './SecurityRequirement';
