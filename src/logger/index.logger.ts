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

export type Listeners<T = unknown> = {
  listeners?: (input: NodeJS.ReadStream) => {
    onReadable?: () => void;
    onError?: (error: unknown) => void;
    onEnd?: () => void;
    onData?: (chunk: T) => void;
    onStart?: () => void;
  };
};

enum Keys {
  ctrl_backspace = "\x17",
  ctrl_c = "\x03",
  backspace = "\x7F",
  backspaceTwo = "\b",
  enter = "\r",
}

const CLEAR_KEYS: string[] = [
  Keys.backspace,
  Keys.backspaceTwo
];

type ReadRawParameters<Level extends string> = ExecuteData<Level> & {
  listeners?: (input: NodeJS.ReadStream) => {
    onError?: (error: unknown) => void;
    onEnd?: () => void;
    onData?: (chunk: Buffer) => void;
    onStart?: () => void;
  };
} & {
  overwriteListeners?: boolean;
  hideInput?: boolean;
  hideSymbol?: string;
};

export const DEFAULT_EXECUTE_DATA: Required<
  Omit<ExecuteData<string>, "color" | "write"> &
    Omit<ReadRawParameters<string>, "listeners" | "color" | "write">
> = {
  level: "info",
  end: "\n",
  join: " ",
  sign: true,
  hideSymbol: "*",
  hideInput: false,
  overwriteListeners: false,
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
    },

    protected readonly out: typeof process.stdout = process.stdout,
    protected readonly input: typeof process.stdin = process.stdin,
  ) {
    this._config = {
      ...config,
      ...loggersNames.GetNames()[name],
      ...data,
      name,
    } as InitLoggerConfig;

    this._execute_data = {
      ...DEFAULT_EXECUTE_DATA,
      color: this._config.colors[1],
      write: this._config.logging,
      level: (data.level || this._config.defaultLevel) as Level,
    };

    this._file_logger = new FileLogger(
      this._config.dir,
      this._config,
      config.logging,
    );

    loggersNames.SetNames({
      [this._config.name]: {
        name: this._config.name,
        colors: this._config.colors,
      },
    });
  }

  /**
   * Главный метод, который используется для вывода информации в терминал
   * и последующей её записи в файл
   * @param text Ваш текст или другая информация, которая будет переведена в `JSON` формат (если Вы закинули массив)
   * или отобразится как `Error` если элемент будет соответствовать `Error`
   *
   * @param data это конфигурация Вашего логгера, которые Вы можете менять, смотря, что Вы хотите
   *
   * ## Значения
   *
   * - `color` — Цвет текста после имени логгера (`this.colors[1]` по умолчанию)
   * - `level` — Уровень логирования (определяет, нужно ли выводить информацию или просто её записать в `.log` файл) (`this._config.defaultLevel` по умолчанию)
   * - `sign` — Булево значение, говорит, нужно ли подписывать данный лог или нет (`true` по умолчанию)
   * - `write` — Булево значение, говорит, нужно ли записывать данный лог в файл или нет (`true` по умолчанию)
   * - `end` — Конец строки для логгера (`\n` по умолчанию)
   * - `join` — Соединение для значения массиов (`" "` по умолчанию)
   *
   * @returns значения `colored` и `base`, где первый — цветное отображение Ваших данных, а `base` — обычное, в Вашем виде данных
   */
  public execute(
    text: string | any[],
    data: ExecuteData<Level> = {},
  ): {
    colored: string[];
    base: unknown[];
  } {
    return this.log(text, data, "execute");
  }

  /**
   * Выводит ошибки в терминал и обрабатывает их, также запись в `.log`-файл
   *
   * @param text Ваши ошибки
   *
   * @param data это конфигурация Вашего логгера, которые Вы можете менять, смотря, что Вы хотите
   *
   * ## Значения
   *
   * - `color` — Цвет текста после имени логгера (`this.colors[1]` по умолчанию)
   * - `level` — Уровень логирования (определяет, нужно ли выводить информацию или просто её записать в `.log` файл) (`this._config.defaultLevel` по умолчанию)
   * - `sign` — Булево значение, говорит, нужно ли подписывать данный лог или нет (`true` по умолчанию)
   * - `write` — Булево значение, говорит, нужно ли записывать данный лог в файл или нет (`true` по умолчанию)
   * - `end` — Конец строки для логгера (`\n` по умолчанию)
   * - `join` — Соединение для значения массиов (`" "` по умолчанию)
   *
   * @returns значения `colored` и `base`, где первый — цветное отображение Ваших данных, а `base` — обычное, в Вашем виде данных
   */
  public error(
    text: Error | Error[],
    data: ExecuteData<Level> = {},
  ): {
    colored: string[];
    base: unknown[];
  } {
    return this.log(text, data, "error");
  }

  public cleanupInput(listeners?: Array<'data' | 'end' | 'error' | 'readable'>) {
    if (listeners) {
      listeners.forEach((listener) => this.input.removeAllListeners(listener));
    } else {
      this.input.removeAllListeners();
    }

    this.input.setRawMode(false);
    this.input.pause();
  }

  /**
   * Читает текст, который введёт пользователь в терминал. Читает все символы последовательно
   *
   * @param text То, что Вы хотите вывести перед тем, как пользователь начнёт ввод
   *
   * @param data это конфигурация Вашего логгера, которые Вы можете менять, смотря, что Вы хотите
   *
   * ## Значения
   *
   * - `color` — Цвет текста после имени логгера (`this.colors[1]` по умолчанию)
   * - `level` — Уровень логирования (определяет, нужно ли выводить информацию или просто её записать в `.log` файл) (`this._config.defaultLevel` по умолчанию)
   * - `sign` — Булево значение, говорит, нужно ли подписывать данный лог или нет (`true` по умолчанию)
   * - `write` — Булево значение, говорит, нужно ли записывать данный лог в файл или нет (`true` по умолчанию)
   * - `end` — Конец строки для логгера (`\n` по умолчанию)
   * - `join` — Соединение для значения массиов (`" "` по умолчанию)
   * - `listeners` — Ваши прослушиватели, если хотите больше гибкости (`{}`)
   * - `overwriteListeners` — Булево значение, говорит, нужно ли перезаписывать дефолтные прослушиватели логгера (`false`)
   * - `hideInput` — Булево значение, говорит, нужно ли прятать текст в терминале (ввод превратится в `****`) (`false`)
   *
   * @returns текст, что ввёл пользователь
   */
  public readRaw(text: string | any[], data: ReadRawParameters<Level> = {}) {
    const configuration = this.resolveData<
      ReadRawParameters<Level>,
      Required<Omit<ReadRawParameters<Level>, "listeners">>
    >(data, this._execute_data as Required<ReadRawParameters<Level>>);

    return new Promise<string | Error>((resolve, reject) => {
      this.input.setRawMode(true);
      this.input.resume();
      this.input.setEncoding("utf8");

      const listeners = (configuration?.listeners || (() => undefined))(
        this.input,
      );

      listeners?.onStart?.();

      this.execute(text, configuration);

      let globalData = "";
      const onData = (buffer: Buffer) => {
        listeners?.onData?.(buffer);

        const key = buffer.toString("utf8");
        if (key === Keys.ctrl_c) {
          cleanup();
          return reject(new Error("User interrupted with Ctrl+C"));
        }

        if (key === Keys.ctrl_backspace) {
          this.clearChars(globalData.length, this.out);
          return (globalData = "");
        }

        if (CLEAR_KEYS.includes(key)) {
          if (globalData.length === 0) {
            return;
          }
          
          this.clearChars(1, this.out);
          return (globalData = globalData.slice(0, -1));
        }

        if (Keys.enter === key) {
          cleanup();
          this.out.write("\n");
          return resolve(globalData);
        }

        globalData += key;
        this.out.write(data.hideInput ? configuration.hideSymbol : key);
      };

      const onError = (err: unknown) => {
        listeners?.onError?.(err);

        cleanup();
        reject(err);
      };

      const onEnd = () => {
        cleanup();
        reject(new Error("Stream ended without data"));
      };

      const cleanup = () => {
        this.input.removeListener("data", onData);
        this.input.removeListener("error", onError);
        this.input.removeListener("end", onEnd);

        this.input.setRawMode(false);
        this.input.pause();

        if (listeners?.onData) {
          this.input.removeListener("data", listeners.onData);
        }
        if (listeners?.onError) {
          this.input.removeListener("error", listeners.onError);
        }
        if (listeners?.onEnd) {
          this.input.removeListener("end", listeners.onEnd);
        }
      };

      if (data.overwriteListeners) {
        this.input.on("data", listeners?.onData || onData);
        this.input.on("error", listeners?.onError || onError);
        this.input.on("end", listeners?.onEnd || onEnd);
      } else {
        this.input.on("data", onData);
        this.input.on("error", onError);
        this.input.on("end", onEnd);
      }
    });
  }

  /**
   * Читает текст, который введёт пользователь в терминал. Читает всё целиком
   *
   * @param text То, что Вы хотите вывести перед тем, как пользователь начнёт ввод
   *
   * @param data это конфигурация Вашего логгера, которые Вы можете менять, смотря, что Вы хотите
   *
   * ## Значения
   *
   * - `color` — Цвет текста после имени логгера (`this.colors[1]` по умолчанию)
   * - `level` — Уровень логирования (определяет, нужно ли выводить информацию или просто её записать в `.log` файл) (`this._config.defaultLevel` по умолчанию)
   * - `sign` — Булево значение, говорит, нужно ли подписывать данный лог или нет (`true` по умолчанию)
   * - `write` — Булево значение, говорит, нужно ли записывать данный лог в файл или нет (`true` по умолчанию)
   * - `end` — Конец строки для логгера (`\n` по умолчанию)
   * - `join` — Соединение для значения массиов (`" "` по умолчанию)
   * - `listeners` — Ваши прослушиватели, если хотите больше гибкости (`{}`)
   *
   * @returns текст, что ввёл пользователь
   */
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

      listeners?.onStart?.();

      const cleanup = () => {
        this.input.removeListener("readable", onReadable);
        this.input.removeListener("error", onError);
        this.input.removeListener("end", onEnd);

        if (listeners?.onData) {
          this.input.removeListener("data", listeners.onData);
        }

        this.input.pause();
      };

      this.execute(text, configuration);

      const onReadable = () => {
        try {
          listeners?.onReadable?.();

          const userInput: string = this.input.read();

          if (!userInput) {
            return reject(new Error("No user input resolved"));
          }
          cleanup();
          const input = userInput.replace(/\r?\n$/, "");
          this._file_logger.execute("User: " + input);
          return resolve(input);
        } catch (error) {
          cleanup();
          return reject(error);
        }
      };

      const onError = (err: unknown) => {
        listeners?.onError?.(err);
        cleanup();
        return reject(err);
      };

      const onEnd = () => {
        listeners?.onEnd?.();
        cleanup();
        return reject(new Error("Stream ended without data"));
      };

      this.input.on("readable", onReadable);
      this.input.on("error", onError);
      this.input.on("end", onEnd);

      if (listeners?.onData) {
        this.input.on("data", listeners.onData);
      }
    });
  }

  /**
   * Изменяет последнюю линию в терминале
   *
   * @param text То, что Вы хотите вывести перед тем, как пользователь начнёт ввод
   * @param data это конфигурация Вашего логгера, которые Вы можете менять, смотря, что Вы хотите
   *
   * ## Значения
   *
   * - `color` — Цвет текста после имени логгера (`this.colors[1]` по умолчанию)
   * - `level` — Уровень логирования (определяет, нужно ли выводить информацию или просто её записать в `.log` файл) (`this._config.defaultLevel` по умолчанию)
   * - `sign` — Булево значение, говорит, нужно ли подписывать данный лог или нет (`true` по умолчанию)
   * - `write` — Булево значение, говорит, нужно ли записывать данный лог в файл или нет (`true` по умолчанию)
   * - `end` — Конец строки для логгера (`\n` по умолчанию)
   * - `join` — Соединение для значения массиов (`" "` по умолчанию)
   * - `ignoreLineBreakerError` — Булево значение, говорит, игнорировать ли ошибки о `\n` (`false` по умолчанию)
   *
   * @returns тот же метод для замены предыдущего текста
   *
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

    const configLevel = this._config.levels[config.level];
    const messageLevel = this._config.levels[configuration.level];
    
    if (configLevel === undefined || messageLevel === undefined) {
      throw new Error(`Invalid log level. Config level: ${config.level}, Message level: ${configuration.level}`);
    }
    
    const isLevelEqualsOrLess = configLevel <= messageLevel;
    if (isLevelEqualsOrLess) {
      // Используем уже окрашенный текст без дополнительного окрашивания
      this.out.write(prefix + colored.join(join) + suffix);
    }

    const logFileEnabled = config.logging || configuration.write;
    if (logFileEnabled) {
      this.logFileService({ type, text, colored });
    }

    return {
      colored,
      base,
    };
  }

  private clearChars(length: number, stdout: typeof process.stdout) {
    const clear = new Array(length).fill("\b").join("");
    const space = new Array(length).fill(" ").join("");
    stdout.write(clear + space + clear);
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

  private resolveData<T, K = Required<T>>(
    data: Partial<T>,
    defaultData: K,
  ): Partial<T> & K {
    return { ...defaultData, ...data };
  }

  private resolveText(text: string | unknown[], color?: Colors) {
    const out = typeof text === "string" ? [text] : text;
    const finalColor = color || this._config.colors[1];
    const seen = new WeakSet();

    const output: string[] = out.map((text) => {
      const processedText = typeof text !== "string"
        ? text instanceof Error
          ? text.stack || text.message
          : JSON.stringify(text, (key, value) => {
              if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) {
                  return '[Circular]';
                }
                seen.add(value);
              }
              return value;
            }, 4)
        : text;
      
      // Добавляем цвет только если он определен
      return finalColor ? paint(processedText, finalColor) : processedText;
    });

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
