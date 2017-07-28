/// <reference types="node" />
import { RequestOptions } from 'http';
declare function get(protocol: any, host: any, path: any, options?: any, requestOptions?: RequestOptions): Promise<string>;
export default get;
