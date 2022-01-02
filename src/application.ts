import ololog from 'ololog';
import { ethers } from 'ethers';
import { Config } from './interface';
import { Evm } from './providers/evm';
import { EndOfEvents } from './providers/interface';
import { ObjectConfig } from './object-config';

export class Application {
  readonly config: Config;
  readonly logging: boolean;
  readonly log: ololog;

  constructor(config: Config, logging: boolean) {
    this.config = config;
    this.logging = logging;
    this.log = ololog.configure({ locate: false, time: true });
  }

  async indexUniV2Pool(onEnd?: Function, stringifyBalances = false): Promise<Function> {
    return this.index(async balances => {
      const evm = new Evm(this.config.get('rpc') as string);

      this.logging && this.log.darkGray(
        `Calculating ${balances.size} LPs holdings in "${this.config.get('token')}" Uni V2 pool`
      );
      const holdings = await evm.getUniV2Holdings(
        this.config.get('token') as string,
        balances,
        this.config.get('end') as number,
        stringifyBalances,
      );

      // eslint-disable-next-line @typescript-eslint/no-empty-function
      return (onEnd ?? (() => { }))(holdings);
    }, true, false); // doesn't make sense if no balances read 
  }

  async index(onEnd?: Function, readBalances = false, stringifyBalances = false): Promise<Function> {
    const evm = new Evm(this.config.get('rpc') as string);
    
    this.logging && this.log.green(await evm.info());
    this.logging && this.log.green(`TOKEN=${this.config.get('token')}`);
    this.logging && this.log.green(`DENOMINATION=${this.config.get('denomination')}`);
    this.logging && this.log.green(`START_BLOCK=${this.config.get('start')}`);
    this.logging && this.log.green(`END_BLOCK=${this.config.get('end')}`);

    const uniqueAddresses = readBalances ? new Set() : null;
    const cancel = await evm.listenErc20Transfers(
      this.config.get('token') as string,
      this.config.get('denomination') as number,
      async (event) => {
        if (event == EndOfEvents) {
          let balances = null;

          if (readBalances) {
            uniqueAddresses.delete(ethers.constants.AddressZero);

            this.logging && this.log.darkGray(`Read balances of ${uniqueAddresses.size} addresses`);
            balances = await evm.getErc20Balances(
              this.config.get('token') as string,
              uniqueAddresses as Set<string>,
              stringifyBalances
            );
            this.logging && this.log.darkGray(`Found ${balances.size} addresses w/ positive balances`);
          }

          // eslint-disable-next-line @typescript-eslint/no-empty-function
          return (onEnd ?? (() => { }))(balances);
        }

        this.logging && this.log.yellow(`[${event.blockNumber}] ${event.type}(${event.fromShort}, ${event.toShort}, ${event.amountHuman})`);

        if (readBalances) {
          uniqueAddresses.add(event.from);
          uniqueAddresses.add(event.to);
        }
      },
      this.config.get('start') as number,
      this.config.get('end') as number,
    );

    return () => {
      this.logging && this.log.yellow('Stopping...');
      cancel();
    };
  }

  static createFromConfig(config: Object, logging = false): Application {
    return new this(new ObjectConfig(config), logging);
  }

  static create(config: Config, logging = false): Application {
    return new this(config, logging);
  }
}
