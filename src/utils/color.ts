import { Colors } from "./colors";

export const color = (text: string, color: Colors) =>
  color + text + Colors.reset;
