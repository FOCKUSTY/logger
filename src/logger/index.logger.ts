import Configurator from "../config/configurator";
const { config } = new Configurator();

import { Colors } from "../utils/colors";
import { color as paint } from "../utils/color";

import { LevelKeys, LoggerName, Config } from "../data/loggers.types";
import LoggersNames from "../data/loggers.names";

import FileLogger from "./file.logger";

export const loggersNames = new LoggersNames(config.logging);

export type ExecuteData<Level extends string> = Partial<{
  color: Colors;
  level: LevelKeys<Level>;
  sign: boolean;
  write: boolean;
  end: string;
  join: string;
}>;

export type InitLoggerConfig<IsPartial extends boolean = false> = {
  name: string;
  colors: [Colors, Colors];
  filePath?: string;
  prefix?: string;
} & (IsPartial extends false ? Config : Partial<Config>);

export type TextTypes = "execute" | "error";
export type ResolveTextType<T extends TextTypes> = {
  execute: string | unknown[];
  error: Error | Error[];
}[T];

export type Listeners = {
  listeners?: (input: NodeJS.ReadStream) => {
    onReadable?: () => void;
    onError?: (error: unknown) => void;
    onEnd?: () => void;
    onData?: (chunk: unknown) => void;
    onStart?: () => void;
  };
};

export const DEFAULT_EXECUTE_DATA: Required<
  Pick<ExecuteData<string>, "level" | "end" | "join" | "sign">
> = {
  level: "info",
  end: "\n",
  join: " ",
  sign: true,
};

export class Logger<T extends string, Level extends string> {
  private readonly _file_logger: FileLogger;

  private readonly _config: InitLoggerConfig;
  private readonly _execute_data: Required<ExecuteData<Level>>;

  public constructor(
    public readonly name: LoggerName<T>,
    data: Partial<
      {
        colors: [Colors, Colors];
        dir: string;
        filePath: string;
        prefix: string;
      } & Config
    > = {
      ...DEFAULT_EXECUTE_DATA,
      ...config,
    },

    protected readonly out: typeof process.stdout = process.stdout,
    protected readonly input: typeof process.stdin = process.stdin,
  ) {
    this._config = {
      ...config,
      ...data,
    } as InitLoggerConfig;

    this._execute_data = {
      ...DEFAULT_EXECUTE_DATA,
      color: config.colors[0],
      write: config.logging,
      level: (data.level || config.defaultLevel) as Level,
    };

    this._file_logger = new FileLogger(this._config.dir, this._config, config.logging);

    loggersNames.SetNames({
      [this._config.name]: {
        name: this._config.name,
        colors: this._config.colors,
      },
    });
  }

  public execute(
    text: string | any[],
    data: ExecuteData<Level> = {},
  ): {
    colored: string[];
    base: unknown[];
  } {
    return this.log(text, data, "execute");
  }

  public error(
    text: Error | Error[],
    data: ExecuteData<Level> = {},
  ): {
    colored: string[];
    base: unknown[];
  } {
    return this.log(text, data, "error");
  }

  public read(text: string | any[], data: ExecuteData<Level> & Listeners = {}) {
    const configuration = this.resolveData<
      ExecuteData<Level> & Listeners,
      Required<ExecuteData<Level>>
    >(data, this._execute_data);

    return new Promise<string | Error>((resolve, reject) => {
      this.input.resume();
      this.input.setEncoding("utf8");

      const listeners = (configuration?.listeners || (() => undefined))(
        this.input,
      );

      const onStart = listeners?.onStart || (() => {});
      onStart();

      const cleanup = () => {
        this.input.removeAllListeners();
      };

      this.execute(text, configuration);

      const onReadable = () => {
        if (listeners?.onReadable) listeners.onReadable();

        const userInput: string = this.input.read();
        if (!userInput) {
          cleanup();
          reject(new Error());
        }

        cleanup();
        const input = userInput.slice(0, userInput.indexOf("\r\n")) as string;
        this._file_logger.execute("User: " + input);
        resolve(input);
      };

      const onError = (err: unknown) => {
        if (listeners?.onError) listeners.onError(err);

        cleanup();
        reject(err);
      };

      const onEnd = () => {
        if (listeners?.onEnd) listeners.onEnd();

        cleanup();
        reject(new Error("Stream ended without data"));
      };

      this.input.on("readable", onReadable);
      this.input.on("error", onError);
      this.input.on("end", onEnd);
      this.input.on("data", listeners?.onData || (() => {}));
    });
  }

  /**
   * @example
   * ```ts
   * const logger = new Logger();
   *
   * const datas = [
   *   "|",
   *   "/",
   *   "—",
   *   "\\",
   * ];
   *
   * let i = 1;
   *
   * const changeLine = logger.changeLine(datas[i-1], { end: "" });
   *
   * setInterval(() => {
   *   if (i>datas.length-1) i = 0;
   *
   *   changeLine(datas[i++]);
   * }, 200);
   * ```
   */
  public changeLine(
    text: string | any[],
    data: ExecuteData<Level> & { ignoreLineBreakerError?: boolean } = {},
  ) {
    const configuration = this.resolveData<
      ExecuteData<Level> & { ignoreLineBreakerError?: boolean },
      Required<ExecuteData<Level>>
    >(data, this._execute_data);

    const errorCaptched =
      !configuration.ignoreLineBreakerError && configuration.end.includes("\n");
    if (errorCaptched) {
      throw new Error("Can not resolve line breaker");
    }

    this.execute(text, configuration);

    return (
      t: string | any[],
      d: ExecuteData<Level> & { ignoreLineBreakerError?: boolean } = {},
    ) => {
      this.out.cursorTo(-1);
      this.out.clearLine(0);

      return this.changeLine(t, { ...data, ...d });
    };
  }

  protected executeLogFile(
    text: ResolveTextType<"execute">,
    colored: string[],
  ) {
    if (typeof text === "string") {
      this._file_logger.execute(`${this.name}: ${text}`);
    } else {
      this._file_logger.execute(`${this.name}:`);

      for (const msg of colored) {
        this._file_logger.execute(msg[1]);
      }
    }
  }

  protected errorLogFile(text: ResolveTextType<"error">) {
    this._file_logger.error(text);
  }

  private log<Type extends TextTypes>(
    text: ResolveTextType<Type>,
    data: ExecuteData<Level>,
    type: Type,
  ): {
    colored: string[];
    base: unknown[];
  } {
    const configuration = this.resolveData<ExecuteData<Level>>(
      data,
      this._execute_data,
    );
    const { colored, base } = this.resolveText(
      Array.isArray(text) ? text : [text],
      configuration.color,
    );

    const name = paint(this.name, this._config.colors[0]) + ":";
    const date = `[${new Date().toISOString()}]`;

    const { prefix, join, suffix } = this.resolveAffix({
      ...configuration,
      date,
      name,
    });

    const isLevelEqualsOrLess =
      this._config.levels[config.level] <=
      this._config.levels[configuration.level];
    if (isLevelEqualsOrLess) {
      this.out.write(
        prefix +
          (typeof text === "string"
            ? colored.join(join)
            : paint(colored.join(join), configuration.color)) +
          suffix,
      );
    }

    const logEnabled = (config.logging && this._file_logger) || configuration.write;
    if (logEnabled) {
      this.logFileService({ type, text, colored });
    }

    return {
      colored,
      base,
    };
  }

  private logFileService<Type extends TextTypes>({
    type,
    text,
    colored,
  }: {
    type: Type;
    text: ResolveTextType<Type>;
    colored: string[];
  }) {
    const suffix = "LogFile" as const;
    const prefix = type;
    const name = `${prefix}${suffix}` as `${Type}LogFile`;

    this[name](<any>text, colored);
  }

  public get write() {
    return this._file_logger.execute;
  }

  public get colors(): [Colors, Colors] {
    return this._config.colors;
  }

  private resolveData<T, K = Required<T>>(data: Partial<T>, defaultData: K) {
    return { ...defaultData, ...data };
  }

  private resolveText(text: string | unknown[], color?: Colors) {
    const out = typeof text === "string" ? [text] : text;

    const output: string[] = out.map((text) =>
      paint(
        typeof text !== "string"
          ? text instanceof Error
            ? text.stack || text.message
            : JSON.stringify(text, undefined, 4)
          : text,
        color || this._config.colors[1],
      ),
    );

    return {
      colored: output,
      base: out,
    };
  }

  private resolveAffix({
    date,
    name,
    end,
    join,
    sign,
  }: {
    date: string;
    name: string;
    sign?: boolean;
    end?: string;
    join?: string;
  }) {
    const prefix = this.resolveLogPrefix({
      date,
      dateEnabled: this._config.date,
      sign: name,
      signEnabled: sign !== false,
    });

    const resolvedJoin = this.resolveExecuteData("join", join);
    const suffix = this.resolveExecuteData("end", end);

    return {
      prefix,
      suffix,
      join: resolvedJoin,
    };
  }

  private resolveExecuteData<T extends "end" | "join">(key: T, data?: string) {
    return data !== undefined ? data : DEFAULT_EXECUTE_DATA[key];
  }

  private resolveLogPrefix({
    date,
    dateEnabled,
    sign,
    signEnabled,
  }: {
    date: string;
    dateEnabled: boolean;
    sign: string;
    signEnabled: boolean;
  }) {
    const datePrefix = dateEnabled ? date + " " : "";
    const signPrefix = signEnabled ? sign + " " : "";

    return datePrefix + signPrefix;
  }
}

export default Logger;
