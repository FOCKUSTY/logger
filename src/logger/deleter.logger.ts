import Configurator from "../config/configurator";
const { config } = new Configurator();

import path from "path";
import fs from "fs";

const DAY = 60 * 60 * 24;
const FORMAT: any = "*&0000.00.00";
const FILTER = new RegExp(
  FORMAT.replace("*", "[a-zA-Z]?").replace("&", "[!@#$%^&*()-+]?").replaceAll("0", "[0-9]"),
  "gi"
);
const LOG_DIR_NAME = "log";

const pathFormat = (...p: string[]) => path.resolve(path.join(...p));

class Deleter {
  private readonly _dir: string = config.dir;

  public constructor(dir: string) {
    this._dir = pathFormat(dir);
  }

  public init() {
    const dir = fs.readdirSync(pathFormat(this._dir, LOG_DIR_NAME));
    for (const log of dir) {
      const { name } = path.parse(pathFormat(this._dir, LOG_DIR_NAME, log));
      const date = name.match(FILTER);

      if (!date) continue;

      const time = date[0].split(".");

      const now = new Date().getTime();
      const deleteTime = new Date(...time.map(t => +t) as [number, number, number]).getTime() + DAY * config.deletion_interval * 1000;

      try {
        if (now > deleteTime) {
          fs.unlinkSync(pathFormat(this._dir, LOG_DIR_NAME, log));

          continue;
        }
      } catch { /* empty */ }
    }
  }
}

export default Deleter;
