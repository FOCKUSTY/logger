import type { LoggerName } from "./loggers.type";
import { Colors } from "f-formatter/colors";

const loggers: {
    [key: LoggerName<string>]: { name: string, colors: [ Colors, Colors ] }
} = {
    Success:  { name: 'Success',  colors: [ Colors.red,          Colors.green   ]},
    Fail:     { name: 'Fail',     colors: [ Colors.red,          Colors.red     ]},
};

export default loggers;