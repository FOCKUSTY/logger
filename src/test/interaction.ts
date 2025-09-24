import { Configurator } from "../config";
import { join } from "path";

new Configurator({
  dir: join(__dirname, "..", ".."),
  logging: true,
  create_file: true,
  overwrite_file: true,
  level: "info",
  date: false,
});

import Logger, { Colors as c } from "../index";

(async () => {
  const logger = new Logger("Tester");

  logger.execute("Hello");

  await logger.read("Your name: ", { end: "" });
})();
