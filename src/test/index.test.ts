import Test from "./test.class";

import Configurator from "../config/configurator";
import { join } from "path";

new Configurator({
  dir: join(__dirname, "..", ".."),
  logging: true,
  create_file: true,
  overwrite_file: true,
  level: "info",
  date: false,
});

import Logger, { Colors as c } from "../../index";

const logger = new Logger("Tester");
new Logger("Commands", { colors: [c.brightYellow, c.magenta] });

const err = new Error("Some error");

describe("Logger", () => {
  (() => {
    const tests: [string, string][] = [
      [
        c.reset + "Привет, Мир !" + c.reset,
        logger.execute("Привет, Мир !", { level: "warn" }).colored[0],
      ],
      [
        c.reset + (err.stack || `${err.name} ${err.message}`) + c.reset,
        logger.error(err, { level: "warn" }).colored[0],
      ],
      [
        c.reset + "Hello, World !" + c.reset,
        logger.execute("Hello, World !").colored[0],
      ],
      [
        c.magenta + "Hello, World !" + c.reset,
        new Logger("Commands").execute("Hello, World !").colored[0],
      ],
      [
        c.magenta + "Saving..." + c.reset,
        new Logger("Saver", { colors: [c.magenta, c.magenta] }).execute(
          "Saving...",
        ).colored[0],
      ],
    ];

    new Test("nocolor", tests).execute();
  })();
  (() => {
    const tests: [string, string][] = [
      [
        c.magenta + "Маджента" + c.reset,
        logger.execute("Маджента", { color: c.magenta }).colored[0],
      ],
      [
        c.bgGreen + "ГринСкрин" + c.reset,
        logger.execute("ГринСкрин", { color: c.bgGreen }).colored[0],
      ],
      [
        c.black + "Тоталблэк" + c.reset,
        logger.execute("Тоталблэк", { color: c.black }).colored[0],
      ],
      [
        c.magenta + "Loading..." + c.reset,
        new Logger("Saver").execute("Loading...").colored[0],
      ],
    ];

    new Test("colors", tests).execute();
  })();
});
