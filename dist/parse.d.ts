import { Service } from './Service';
declare function parse(xml: string): Promise<Service>;
export default parse;
