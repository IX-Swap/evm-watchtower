import { Config } from './interface';
export declare class ObjectConfig implements Config {
    readonly config: Object;
    constructor(config: Object);
    get(key: string): unknown;
}
