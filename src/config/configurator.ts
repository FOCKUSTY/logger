import Formatter, { Colors } from "f-formatter";

import path from "path";
import fs from "fs";

import type {
  Config,
  SettingKeys,
  Settings,
  ExtraneousConfig as ExtraConfig
} from "../data/loggers.types";

import { extraSettings, settings } from "../data/data";
import Validator from "./validator";

let filePath: string = "./";
const pathFormat = (...p: string[]) => path.resolve(path.join(...p));

class Configurator {
  private readonly _extra_config: ExtraConfig<Settings> = extraSettings;
  private readonly _config: Config = settings;
  private readonly _path: string = pathFormat(settings.dir, ".loggercfg");

  public constructor(config?: Partial<Config> | Partial<ExtraConfig<Settings>>) {
    this.Paste(config);

    if (!(this._config.dir === "./" && filePath === "./")) {
      if (this._config.dir !== "./") filePath = this._config.dir;
      else this._config.dir = filePath;
    }

    this._path = pathFormat(this._config.dir, ".loggercfg");

    this.init();
  }

  private Paste(config?: Partial<Config> | Partial<ExtraConfig<Settings>>) {
    if (!config) return;

    for (const key in config) {
      if (!config[key]) continue;

      if (Object.keys(extraSettings).includes(key)) {
        this._extra_config[key] = config[key];
        continue;
      }

      if (!Object.keys(settings).includes(key)) {
        const str = `"${key}": ${config[key]}`;
        const err = JSON.stringify(config, undefined, 4).replaceAll(
          str,
          new Formatter().Color(str, Colors.bgMagenta)
        );

        throw new Error("Unknown key: " + key + " change or delete it\nAt your file:\n" + err);
      }

      this._config[key] = new Validator(
        key as SettingKeys,
        config[key],
        JSON.stringify(config, undefined, 4)
      ).init();
    }

    return this;
  }

  private Create() {
    try {
      const file = JSON.stringify(this._config, undefined, 4);
      fs.writeFileSync(this._path, file, "utf-8");

      return this._config;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  private Validator(key: SettingKeys, value: Settings): Settings {
    return new Validator(
      key,
      value,
      JSON.stringify(JSON.parse(fs.readFileSync(this._path, "utf-8")), undefined, 0)
    ).init();
  }

  private Validate(config: Config) {
    for (const key in settings) {
      const value = this.Validator(key as SettingKeys, config[key]);

      this._config[key] = value;
    }
  }

  private Read() {
    if (!fs.existsSync(this._path) && this._extra_config.create_file) this.Create();

    if (
      fs.existsSync(this._path) &&
      Object.keys(JSON.parse(fs.readFileSync(this._path, "utf-8") || "{}")).length === 0
    ) {
      console.log(
        Colors.brightYellow + "Your config is empty, returning to default" + Colors.reset
      );

      fs.unlinkSync(this._path);
      this.Create();
    }

    try {
      const config: Config = new Formatter().FromJSONWithPath(this._path);

      this.Validate(config);
    } catch (err: any) {
      if (!fs.existsSync(this._path)) return;

      throw new Error(err);
    }
  }

  private HasPermissions(): boolean {
    if (this._extra_config.create_file) return true;
    if (fs.existsSync(this._path)) return true;

    return false;
  }

  private readonly init = () => {
    if (this.HasPermissions()) this.Read();
  };

  public get config(): Config {
    return { ...this._config, ...this._extra_config };
  }
}

export default Configurator;
