import Configurator from "../config/configurator";
const { config } = new Configurator();

import { LOG_DIR_NAME, FILTER, DAY } from "../data/data";

import path from "path";
import { readdir, unlink } from "fs/promises";

export const pathFormat = (...p: string[]) => path.resolve(path.join(...p));

export class Deleter {
  private readonly _dir: string = config.dir;

  public constructor(dir: string) {
    this._dir = pathFormat(dir);
  }

  public async init() {
    const dir = await readdir(pathFormat(this._dir, LOG_DIR_NAME));

    for (const log of dir) {
      const { name } = path.parse(pathFormat(this._dir, LOG_DIR_NAME, log));
      const date = name.match(FILTER);

      if (!date) continue;

      const time = date[0].split(".");

      const now = new Date().getTime();
      const deleteTime =
        new Date(
          ...(time.map((t) => +t) as [number, number, number]),
        ).getTime() +
        DAY * config.deletion_interval * 1000;

      try {
        if (now > deleteTime) {
          unlink(pathFormat(this._dir, LOG_DIR_NAME, log));

          continue;
        }
      } catch {
        /* empty */
      }
    }
  }
}

export default Deleter;
