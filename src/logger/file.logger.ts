import Configurator from "../config/configurator";
const { config } = new Configurator();

import { Config } from "../data/loggers.types";

import path from "path";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs";

import Deleter from "./deleter.logger";
import { LOG_DIR_NAME, LOG_FILE_EXTENSION } from "../data/data";

const cache = new Map();
const pathFormat = (...p: string[]) => path.resolve(path.join(...p));

export const errorAffixText = "------------------ ERROR ------------------";
export const errorAffix = (error: string) =>
  `${errorAffixText}\n${error}\n${errorAffixText}`;

export abstract class LogStrategy {
  protected readonly _date: Date;
  protected readonly _date_string: string;
  protected readonly _dir: string;
  protected readonly _deleter: Deleter;
  protected readonly _hello: string;
  protected readonly _init: boolean;
  protected readonly _file_name: string;

  protected readonly _config: {
    file_path: string;
    prefix: string;
  } & Config;

  public _cache: string = "";

  abstract file: string | Promise<string>;

  public constructor(
    dir: string,
    data: {
      filePath?: string;
      prefix?: string;
    } & Partial<Config>,
    init: boolean = true,
  ) {
    const prefix = data.prefix ? data.prefix + "-" : "";

    this._date = new Date();
    this._date_string = this._date
      .toLocaleDateString()
      .split(".")
      .reverse()
      .join(".");
    this._config = {
      ...config,
      ...data,
      prefix,
      file_path: data.filePath
        ? data.filePath
        : pathFormat(dir, LOG_DIR_NAME, prefix + this._date_string) +
          LOG_FILE_EXTENSION,
    };
    this._file_name =
      this._config.prefix + this._date_string + LOG_FILE_EXTENSION;

    this._init = init;
    this._dir = pathFormat(dir);
    this._deleter = new Deleter(dir);
    this._hello = `====---- Hello! This is log file of ${this._date_string} ! ----====`;

    if (init) {
      this.init();

      const file = this.readFile();

      this._cache = file;
      cache.set(this._config.file_path, this._cache);
    }
  }

  public abstract execute(text: string): void;
  public abstract error(error: Error | Error[]): void;
  protected abstract init(): void;

  protected abstract createFile(): void;
  protected abstract createFolder(): void;

  protected abstract readFile(): string;
  protected abstract writeFile(): void;
}

export class Log extends LogStrategy {
  public constructor(
    dir: string,
    data: {
      filePath?: string;
      prefix?: string;
    } & Partial<Config>,
    init: boolean = true,
  ) {
    super(dir, data, init);
  }

  public execute(text: string): void {
    if (!this._init) {
      this.init();

      this._cache = this.readFile();
      cache.set(this._config.file_path, this._cache);
    }

    cache.set(
      this._config.file_path,
      (cache.get(this._config.file_path) || this._hello) +
        `\n[${this._date.toISOString()}]: ` +
        text,
    );

    return this.writeFile();
  }

  public error(error: Error | Error[]): void {
    const errorText = (Array.isArray(error) ? error : [error])
      .map((err) => this.parseError(err))
      .join("\n");

    const text = errorAffix(errorText);

    return this.execute(text);
  }

  private parseError(error: Error) {
    return error.stack || `${error.name} ${error.message}`;
  }

  protected init(): Promise<void> {
    this.createFolder();

    return this._deleter.init();
  }

  protected createFile(): void {
    const dir = readdirSync(pathFormat(this._dir, LOG_DIR_NAME));
    const dirIncludesFile = dir.includes(this._file_name);

    if (dirIncludesFile) {
      return;
    }

    return writeFileSync(this._config.file_path, this._hello, "utf-8");
  }

  protected createFolder(): void {
    const dir = readdirSync(this._dir);
    const dirIncludesFile = dir.includes(LOG_DIR_NAME);

    if (!dirIncludesFile) {
      mkdirSync(pathFormat(this._dir, LOG_DIR_NAME), { recursive: true });
    }

    return this.createFile();
  }

  protected readFile(): string {
    return readFileSync(
      pathFormat(this._dir, LOG_DIR_NAME, this._file_name),
      "utf-8",
    );
  }

  protected writeFile(): void {
    return writeFileSync(
      this._config.file_path,
      cache.get(this._config.file_path),
      "utf-8",
    );
  }

  public get file() {
    return this.readFile();
  }
}

export default Log;
