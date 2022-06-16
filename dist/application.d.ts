import ololog from 'ololog';
import { Config } from './interface';
import { UniV2HoldingsResponse, TokenBalance } from './providers/interface';
export declare class Application {
    readonly config: Config;
    readonly logging: boolean;
    readonly log: ololog;
    constructor(config: Config, logging: boolean);
    indexUniV2PoolPromised(stringifyBalances?: boolean): Promise<UniV2HoldingsResponse>;
    indexUniV2Pool(onEnd?: Function, stringifyBalances?: boolean): Promise<Function>;
    indexPromised(readBalances?: boolean, stringifyBalances?: boolean): Promise<Set<TokenBalance>>;
    index(onEnd?: Function, readBalances?: boolean, stringifyBalances?: boolean): Promise<Function>;
    static createFromConfig(config: Object, logging?: boolean): Application;
    static create(config: Config, logging?: boolean): Application;
}
