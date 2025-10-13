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

  // const datas = ["|", "/", "—", "\\"];

  // let i = 1;

  // const changeLine = logger.changeLine(datas[i - 1], { end: "" });

  // setInterval(() => {
  //   if (i > datas.length - 1) i = 0;

  //   changeLine(datas[i++]);
  // }, 200);

  const data = await logger.readRaw("Your name:", {
    end: " ",
    hideInput: true,
  });
  // const data2 = await logger.readRaw("Your name:", { end: " " });
  const data2 = await logger.read("Abc:", { end: " " });

  // for (let i = 0; i < 10; i++) {
  //   setTimeout(() => {
  //     logger.execute("AAAAAAAAA");
  //   }, 1000 * i);
  // };

  console.log({ data });
  console.log({ data2 });
})();
