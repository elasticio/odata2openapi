import Operation from './Operation';

interface PathItem {
  get?: Operation;
  put?: Operation;
  post?: Operation;
  delete?: Operation;
  options?: Operation;
  head?: Operation;
  patch?: Operation;
}

export default PathItem;
