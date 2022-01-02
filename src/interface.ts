export interface Config {
  get(string): unknown;
}

export enum Commands {
  INDEX = 'index',
  INDEX_LP = 'index-lp',
}
