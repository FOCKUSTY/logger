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

(async () => {
  const logger = new Logger("Tester");

  logger.execute("Hello");

  const data = await logger.read("Your name: ", { end: "", listeners: (input) => ({
    onReadable() {
      console.log(1);
    },
    onStart() {
      console.log(2);
    },
    onEnd() {
      console.log(3);
    },
    onData(chunk) {
      console.log({chunk});
    }
  })});

  console.log({data});
})();
