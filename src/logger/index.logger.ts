import Configurator from "../config/configurator";
const { config } = new Configurator();

import Formatter, { Colors } from "f-formatter";

import { LevelKeys, LoggerName, Config } from "../data/loggers.types";
import LoggersNames from "../data/loggers.names";

import FileLogger from "./file.logger";

const formatter = new Formatter();
const loggersNames = new LoggersNames(config.logging);

class InitLogger {
  private readonly _name: string;
  private readonly _colors: [Colors, Colors];
  private readonly _log: FileLogger;
  private readonly _config: {
    name: string;
    colors: [Colors, Colors];
    filePath?: string;
    prefix?: string;
  } & Config;

  public constructor(
    dir: string,
    data: {
      name: string;
      colors: [Colors, Colors];
      filePath?: string;
      prefix?: string;
    } & Partial<Config>
  ) {
    this._name = data.name;
    this._colors = data.colors;

    this._config = {
      ...data,
      logging: data.logging || config.logging,
      dir: data.dir || config.dir,
      level: data.level || config.level,
      levels: data.levels || config.levels,
      defaultLevel: data.defaultLevel || config.defaultLevel,
      deletion_interval: data.deletion_interval || config.deletion_interval,
      date: data.date || config.date,
      date_format: data.date_format || config.date_format,
      colors: data.colors || config.colors,
      loggers: data.loggers || config.loggers
    };

    this._log = new FileLogger(dir, this._config, config.logging);
  }

  public readonly execute = <Level extends string>(
    text: string | any[],
    data: {
      color: Colors;
      level: LevelKeys<Level>;
      write: boolean;
    } = {
      color: this._colors[1],
      level: "info",
      write: config.logging
    }
  ): [string, string][] => {
    text = typeof text === "string" ? [text] : text;

    const name = formatter.Color(this._name, this._colors[0]) + ":";
    const date = `[${new Date().toISOString()}]`;

    const output: [string, string][] = text.map((t) => {
      const txt =
        typeof t !== "string"
          ? t instanceof Error
            ? t.stack || "undefined error"
            : JSON.stringify(t, undefined, 4)
          : t;

      return [formatter.Color(txt, data.color), txt];
    });
    const start = this._config.date ? date + " " : "";

    const isLevelEqualsOrLess = this._config.levels[config.level] <= this._config.levels[data.level]; 
    if (isLevelEqualsOrLess) {
      if (typeof text === "string") {
        console.log(start + name, ...output.map((o) => o[0]))
      } else {
        console.log(start + name + data.color, ...output.map((o) => o[0]), Colors.reset);
      }
    }

    const logEnabled = (config.logging && this._log) || data.write;
    if (logEnabled) {
      if (typeof text === "string") {
        this._log.writeFile(text)
      } else {
        for (const msg of output) {
          this._log.writeFile(msg[1])
        }
      };
    }

    return output;
  };

  public get write() {
    return this._log.writeFile;
  }

  public get colors(): [Colors, Colors] {
    return this._colors;
  }

  public get name(): string {
    return this._name;
  }
}

const loggers: { [key: LoggerName<string>]: InitLogger } = {};

class Logger<T extends string> {
  private readonly _name: LoggerName<T>;
  private readonly _dir: string;
  private readonly _level: LevelKeys = "info";
  private readonly _write: boolean = config.logging;

  private readonly _file_log?: { filePath?: string; prefix?: string };

  private _colors: [Colors, Colors];
  private _logger: InitLogger;

  public constructor(
    name: LoggerName<T>,
    data: {
      colors?: [Colors, Colors];
      filePath?: string;
      prefix?: string;

      dir?: string;
      level?: LevelKeys;
      write?: boolean;
    } = {
      dir: config.dir,
      level: "info",
      write: config.logging
    }
  ) {
    this._name = name;
    this._file_log = data;

    this._dir = data.dir || config.dir;
    this._level = data.level || "info";
    this._write = data.write || config.logging;

    this._colors = data?.colors
      ? data.colors
      : loggers[name]
        ? loggers[name].colors
        : loggersNames.GetNames()[name]?.colors || config.colors;

    this._logger = this.init();
  }

  private readonly init = (): InitLogger => {
    this._logger = new InitLogger(this._dir, {
      name: this._name,
      colors: this._colors,
      ...this._file_log
    });

    for (const key in loggersNames.GetNames()) {
      const logger = loggersNames.GetNames()[key];

      loggers[key] = new InitLogger(this._dir, {
        name: logger.name,
        colors: logger.colors
      });
    }

    loggers[this._name] = this._logger;
    loggersNames.SetNames({
      [this._logger.name]: {
        name: this._logger.name,
        colors: this._colors
      }
    });

    if (!this._colors) this._colors = this._logger.colors;

    return this._logger;
  };

  public get write() {
    return this._logger.write;
  }

  public readonly execute = <T extends string>(
    text: string | any[],
    data?: {
      color?: Colors;
      level?: LevelKeys<T>;
      write?: boolean;
    }
  ) => {
    return this._logger.execute(text, {
      color: data?.color || this._colors[1],
      level: data?.level || this._level,
      write: data?.write || this._write
    });
  };

  public get colors(): [Colors, Colors] {
    return this._colors;
  }

  public get name(): LoggerName<T> {
    return this._name;
  }
}

export default Logger;
