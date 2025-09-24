import type { Config, LoggersNameType } from "./loggers.types";

import { Colors } from "../utils/colors";

import { join as pJoin, parse, resolve } from "path";
import { existsSync, readFileSync, writeFileSync } from "fs";

import Configurator from "../config/configurator";

import {
  DEFAULT_COLORS,
  LOGGER_CONFIG_FILE_NAME,
  LOGGER_LOGGERS_FILE_NAME,
} from "./data";

const { config } = new Configurator();
const cache: LoggersNameType = {
  Success: { name: "Success", colors: [Colors.red, Colors.green] },
  Fail: { name: "Fail", colors: [Colors.red, Colors.red] },
};

const join = (...p: string[]) => resolve(pJoin(...p));

class LoggersNames {
  private readonly _standart: LoggersNameType = cache;

  private readonly _dir: string = config.dir;
  private readonly _default_path = join(config.dir, LOGGER_LOGGERS_FILE_NAME);
  private readonly _path = this._default_path;
  private readonly _create_file: boolean;

  public constructor(createFile: boolean, dir: string = config.dir) {
    this._dir = dir;
    this._default_path = join(dir, LOGGER_LOGGERS_FILE_NAME);

    this._create_file = createFile;
    this._path = this.ChoosePath();
  }

  private readonly ChoosePath = (): string => {
    const loggercfg = join(this._dir, LOGGER_CONFIG_FILE_NAME);

    if (existsSync(loggercfg)) {
      return loggercfg;
    }

    if (existsSync(this._default_path)) {
      return this._default_path;
    }

    if (this._create_file) {
      writeFileSync(
        this._default_path,
        JSON.stringify(this._standart, undefined, 2),
        "utf-8",
      );
    }

    return this._default_path;
  };

  public readonly SetNames = (names: LoggersNameType) => {
    const existingNames = this.GetNames();
    const output: LoggersNameType = {};

    for (const key in names) {
      output[key] = names[key];
      cache[key] = names[key];
    }

    for (const key in existingNames) {
      const existingValue = existingNames[key];
      const value = names[key];

      if (value && value.colors.toString() != DEFAULT_COLORS.toString()) {
        output[key] = value;
        cache[key] = value;
      } else {
        output[key] = existingValue;
        cache[key] = existingValue;
      }
    }

    if (!this._create_file && !existsSync(this._path)) {
      return names;
    }

    if (parse(this._path).base === LOGGER_CONFIG_FILE_NAME) {
      const file: Config = JSON.parse(readFileSync(this._path, "utf-8"));
      file.loggers = output;

      writeFileSync(this._path, JSON.stringify(file, undefined, 2), "utf-8");
    } else {
      writeFileSync(this._path, JSON.stringify(output, undefined, 2), "utf-8");
    }

    return names;
  };

  public readonly GetNames = (): LoggersNameType => {
    if (!existsSync(this._path)) return cache;

    if (parse(this._path).base === LOGGER_CONFIG_FILE_NAME) {
      const file: Config = JSON.parse(readFileSync(this._path, "utf-8"));

      return file.loggers || this._standart;
    } else {
      const file = JSON.parse(readFileSync(this._path, "utf-8"));

      return file;
    }
  };

  public get standart() {
    return this._standart;
  }
}

export default LoggersNames;
