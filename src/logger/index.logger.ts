import Configurator from "../config/configurator";
const { config } = new Configurator();

import Formatter, { Colors } from "f-formatter";

import { LevelKeys, LoggerName, Config } from "../data/loggers.types";
import LoggersNames from "../data/loggers.names";

import FileLogger from "./file.logger";

const formatter = new Formatter();
const loggersNames = new LoggersNames(config.logging);

type ExecuteData<Level extends string> = Partial<{
  color: Colors;
  level: LevelKeys<Level>;
  sign: boolean;
  write: boolean;
  end: string;
  join: string;
}>;

type InitLoggerConfig<IsPartial extends boolean = false> = {
  name: string;
  colors: [Colors, Colors];
  filePath?: string;
  prefix?: string;
} & (
  IsPartial extends false
    ? Config
    : Partial<Config>);

const DEFAULT_EXECUTE_DATA: Required<Pick<ExecuteData<string>, "level"|"end"|"join"|"sign">> = {
  level: "info",
  end: "\n",
  join: " ",
  sign: true
};

class InitLogger {
  private readonly _name: string;
  private readonly _colors: [Colors, Colors];
  private readonly _log: FileLogger;
  private readonly _config: InitLoggerConfig;

  public constructor(
    dir: string,
    data: InitLoggerConfig<true>,

    protected readonly out: typeof process.stdout = process.stdout,
    protected readonly input: typeof process.stdin = process.stdin
  ) {
    this._name = data.name;
    this._colors = data.colors;

    this._config = {
      ...config,
      ...data
    } as {
      name: string;
      colors: [Colors, Colors];
      filePath?: string;
      prefix?: string;
    } & Config;

    this._log = new FileLogger(dir, this._config, config.logging);
  }

  public readonly execute = <Level extends string>(
    text: string | any[],
    data: ExecuteData<Level> = {
      ...DEFAULT_EXECUTE_DATA,
      color: this._colors[1],
      write: config.logging,
    } as ExecuteData<Level>
  ): {
    colored: string[],
    base: unknown[]
  } => {
    const {
      colored,
      base
    } = this.resolveText(text, data.color);

    const name = formatter.Color(this._name, this._colors[0]) + ":";
    const date = `[${new Date().toISOString()}]`;

    const {
      prefix,
      join,
      suffix
    } = this.resolveAffix({
      ...data,
      date,
      name,
    });
 
    const isLevelEqualsOrLess = this._config.levels[config.level] <= this._config.levels[data.level || config.defaultLevel]; 
    if (isLevelEqualsOrLess) {
      this.out.write(prefix + (
        typeof text === "string"
          ? colored.join(join)
          : formatter.Color(colored.join(join), data.color || this._colors[1])
      ) + suffix);
    }

    const logEnabled = (config.logging && this._log) || data.write;
    if (logEnabled) {
      if (typeof text === "string") {
        this._log.execute(`${this._name}: ${text}`)
      } else {
        this._log.execute(`${this._name}:`);
        for (const msg of colored) {
          this._log.execute(msg[1])
        }
      };
    }

    return {
      colored,
      base
    };
  };

  public readonly readLine = <Level extends string>(
    text: string | any[],
    data: ExecuteData<Level> = {
      ...DEFAULT_EXECUTE_DATA,
      color: this._colors[1],
      write: config.logging,
    } as ExecuteData<Level>
  ) => {
    return new Promise<string|Error>((resolve, reject) => {
      this.input.resume();
      this.input.setEncoding("utf8");

      const cleanup = () => {
        this.input.removeListener("readable", onReadable);
        this.input.removeListener("error", onError);
        this.input.removeListener("end", onEnd);
      };

      this.execute(text, data);

      const onReadable = () => {
        const userInput: string = this.input.read();
        if (!userInput) {
          cleanup();
          reject(new Error());
        }
        
        cleanup();
        const input = userInput.slice(0, userInput.indexOf("\r\n")) as string;
        this._log.execute("User: " + input);
        resolve(input);
      };

      const onError = (err: unknown) => {
        cleanup();
        reject(err);
      };

      const onEnd = () => {
        cleanup();
        reject(new Error("Stream ended without data"));
      };

      this.input.on("readable", onReadable);
      this.input.on("error", onError);
      this.input.on("end", onEnd);
    });
  }

  public get write() {
    return this._log.execute;
  }

  public get colors(): [Colors, Colors] {
    return this._colors;
  }

  public get name(): string {
    return this._name;
  }

  private resolveText(text: string | unknown[], color?: Colors) {
    const out = typeof text === "string"
      ? [text]
      : text;

    const output: string[] = out.map(text => formatter.Color(
      typeof text !== "string"
        ? text instanceof Error
          ? text.stack || text.message
          : JSON.stringify(text, undefined, 4)
        : text,
      color || this._colors[1]
    ));

    return {
      colored: output,
      base: out
    }
  }

  private resolveAffix({
    date,
    name,
    end,
    join,
    sign
  }: {
    date: string,
    name: string,
    sign?: boolean,
    end?: string,
    join?: string
  }) {
    const prefix = this.resolveLogPrefix({
      date,
      dateEnabled: this._config.date,
      sign: name,
      signEnabled: sign !== false
    });

    const resolvedJoin = this.resolveExecuteData("join", join);
    const suffix = this.resolveExecuteData("end", end);

    return {
      prefix,
      suffix,
      join: resolvedJoin
    };
  }

  private resolveExecuteData<T extends "end"|"join">(key: T, data?: string) {
    return data !== undefined
      ? data
      : DEFAULT_EXECUTE_DATA[key];
  }

  private resolveLogPrefix({
    date,
    dateEnabled,
    sign,
    signEnabled
  }: {
    date: string,
    dateEnabled: boolean,
    sign: string,
    signEnabled: boolean
  }) {
    const datePrefix = dateEnabled
      ? (date + " ") : "";

    const signPrefix = signEnabled
      ? (sign + " ") : "";

    return (datePrefix + signPrefix);
  }
}

const loggers: { [key: LoggerName<string>]: InitLogger } = {};

class Logger<T extends string, Levels extends string> {
  private readonly _name: LoggerName<T>;
  private readonly _dir: string;

  private readonly _file_log?: { filePath?: string; prefix?: string };

  private readonly _data: ExecuteData<Levels>;

  private _colors: [Colors, Colors];
  private _logger: InitLogger;

  public constructor(
    name: LoggerName<T>,
    data: {
      colors?: [Colors, Colors];
      filePath?: string;
      prefix?: string;
      dir?: string
    } & Omit<ExecuteData<Levels>, "color"> = {
      ...DEFAULT_EXECUTE_DATA,
      dir: config.dir,
      level: "info",
      write: config.logging
    }
  ) {
    this._name = name;
    this._file_log = data;
    this._dir = data.dir || config.dir;
    
    this._colors = data?.colors
      ? data.colors
      : loggers[name]
        ? loggers[name].colors
        : loggersNames.GetNames()[name]?.colors || config.colors;
    
    this._data = {
      ...DEFAULT_EXECUTE_DATA,
      level: config.level as Levels,
      write: config.logging,
      ...data,
      color: this._colors[1],
    }

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

  public readonly execute = (
    text: string | any[],
    data: ExecuteData<Levels> = {
      ...DEFAULT_EXECUTE_DATA,
      color: this._colors[1],
      write: config.logging,
    } as ExecuteData<Levels>
  ) => {
    return this._logger.execute(text, {
      ...this._data,
      ...data
    });
  };

  public readonly read = (
    text: string | any[],
    data: ExecuteData<Levels> = {
      ...DEFAULT_EXECUTE_DATA,
      color: this._colors[1],
      write: config.logging,
    } as ExecuteData<Levels>
  ) => {
    return this._logger.readLine(text, {
      ...this._data,
      ...data
    });
  }

  public get colors(): [Colors, Colors] {
    return this._colors;
  }

  public get name(): LoggerName<T> {
    return this._name;
  }
}

export default Logger;
