import { Config } from './interface';

export class ObjectConfig implements Config {
  public readonly config: Object;

  constructor(config: Object) {
    this.config = config;
  }

  get(key: string): unknown {
    return this.config.hasOwnProperty(key) ? this.config[key] : null;
  }
}
