import * as nconf from "nconf";
import * as yargs from "yargs";
import * as fs from "fs-extra";
import argv from "./argv";
import { Config, Commands } from "./interface";
import { Application } from "./application";

export { Application };

export async function run() {
  const app = Application.createFromConfig(
    {
      rpc: "https://base-sepolia.g.alchemy.com/v2/I_jm3zNKwAzFEwN9DT15-sAhZc5z3I0M",
      token: "0x86333D219158FFD35bBC4Cc2c2C3242df7C483dD",
      denomination: 18,
      start: 0,
      end: 13955856,
    },
    true
  );

  const data = await app.indexPromised(true, true);
  console.log(data);
}

run();
