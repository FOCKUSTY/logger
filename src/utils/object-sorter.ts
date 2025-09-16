import { Config } from "../data/loggers.types";
import { settings } from "../data/data";

type Keys = keyof Config;
const settingsKeys = Object.fromEntries(Object.keys(settings).map((key, index) => [key, index] as const));

export const sort = (object: Partial<Record<Keys, unknown>>) => {
  return Object.fromEntries((Object.keys(object) as Keys[]).sort((a, b) => (
    settingsKeys[a] < settingsKeys[b] ? -1 : 1
  )).map(key => [key, object[key]])) as Partial<Record<Keys, unknown>>;
}