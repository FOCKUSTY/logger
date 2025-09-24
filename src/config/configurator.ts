import Formatter, { Colors } from "f-formatter";

import path from "path";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "fs";

import type {
  Config,
  SettingKeys,
  Settings,
  ExtraneousConfig as ExtraConfig,
} from "../data/loggers.types";

import { sort } from "../utils/object-sorter";
import {
  EXTRA_SETTINGS,
  LOGGER_CONFIG_FILE_NAME,
  ROOT_DIR,
  SETTINGS,
} from "../data/data";
import Validator from "./validator";

let filePath: string = ROOT_DIR;
const pathFormat = (...p: string[]) => path.resolve(path.join(...p));

class Configurator {
  private readonly _extra_config: ExtraConfig<Settings> = EXTRA_SETTINGS;
  private readonly _config: Config = SETTINGS;
  private readonly _path: string = pathFormat(
    SETTINGS.dir,
    LOGGER_CONFIG_FILE_NAME,
  );

  public constructor(
    config?: Partial<Config> | Partial<ExtraConfig<Settings>>,
  ) {
    this.Paste(config);

    if (!(this._config.dir === ROOT_DIR && filePath === ROOT_DIR)) {
      if (this._config.dir !== ROOT_DIR) {
        filePath = this._config.dir;
      } else {
        this._config.dir = filePath;
      }
    }

    this._path = pathFormat(this._config.dir, LOGGER_CONFIG_FILE_NAME);

    this.init();
  }

  private Paste(config?: Partial<Config> | Partial<ExtraConfig<Settings>>) {
    if (!config) return;

    for (const key in config) {
      if (!config[key] && typeof config[key] !== "boolean") continue;

      if (Object.keys(EXTRA_SETTINGS).includes(key)) {
        this._extra_config[key] = config[key];
        continue;
      }

      if (!Object.keys(SETTINGS).includes(key)) {
        const str = `"${key}": ${config[key]}`;
        const err = JSON.stringify(config, undefined, 4).replaceAll(
          str,
          new Formatter().Color(str, Colors.bgMagenta),
        );

        throw new Error(
          "Unknown key: " + key + " change or delete it\nAt your file:\n" + err,
        );
      }

      this._config[key] = new Validator(
        key as SettingKeys,
        config[key],
        JSON.stringify(config, undefined, 4),
      ).init();
    }

    return this;
  }

  private Overwrite() {
    if (!existsSync(this._path)) return;
    if (!this._extra_config.create_file) return;

    const json = readFileSync(this._path, "utf-8");
    const file = JSON.parse(json);

    const config = sort({
      ...file,
      ...this._config,
    });

    writeFileSync(this._path, JSON.stringify(config, undefined, 2), "utf-8");

    return config;
  }

  private Create() {
    const config = sort(this._config);

    const file = JSON.stringify(config, undefined, 2);
    writeFileSync(this._path, file, "utf-8");

    return config;
  }

  private Validator(key: SettingKeys, value: Settings): Settings {
    return new Validator(
      key,
      value,
      JSON.stringify(
        JSON.parse(readFileSync(this._path, "utf-8")),
        undefined,
        0,
      ),
    ).init();
  }

  private Validate(config: Config) {
    for (const key in SETTINGS) {
      const value = this.Validator(key as SettingKeys, config[key]);

      this._config[key] = value;
    }
  }

  private Read() {
    if (!existsSync(this._path) && this._extra_config.create_file)
      this.Create();

    if (
      existsSync(this._path) &&
      Object.keys(JSON.parse(readFileSync(this._path, "utf-8") || "{}"))
        .length === 0
    ) {
      console.log(
        Colors.brightYellow +
          "Your config is empty, returning to default" +
          Colors.reset,
      );

      unlinkSync(this._path);
      this.Create();
    }

    try {
      const config: Config = new Formatter().FromJSONWithPath(this._path);

      this.Validate(config);
    } catch (err: any) {
      if (!existsSync(this._path)) return;

      throw new Error(err);
    }
  }

  private HasPermissions(): boolean {
    if (this._extra_config.create_file) return true;
    if (existsSync(this._path)) return true;

    return false;
  }

  private readonly init = () => {
    if (this._extra_config.overwrite_file) {
      this.Overwrite();
    }

    if (this.HasPermissions()) {
      this.Read();
    }
  };

  public get config(): Config {
    return { ...this._config, ...this._extra_config };
  }
}

export default Configurator;
